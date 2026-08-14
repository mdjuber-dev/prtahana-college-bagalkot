import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function testAll() {
  console.log("==================================================");
  console.log("STARTING END-TO-END RELIABILITY & COMPLIANCE AUDIT");
  console.log("==================================================\n");

  const results = {};

  async function check(name, fn) {
    try {
      await fn();
      results[name] = "PASS";
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results[name] = `FAIL: ${err.message}`;
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. HEALTH CHECK
  await check("HEALTH", async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    const json = await res.json();
    if (res.status !== 200 || !json.success || json.database !== "connected") {
      throw new Error(`Expected { success: true, database: 'connected' }, got ${JSON.stringify(json)}`);
    }
  });

  // 2. AUTHENTICATION
  let adminToken = "";
  await check("AUTH (LOGIN)", async () => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@prarthanapusciencecollege.in",
        password: process.env.ADMIN_PASSWORD || "admin@prarthanapu",
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.token) {
      throw new Error(`Login failed: ${json.error || "No token returned"}`);
    }
    adminToken = json.data.token;
  });

  await check("AUTH (PROTECTED ROUTE)", async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || !json.data?.user) {
      throw new Error(`Protected auth failed: ${json.error}`);
    }
  });

  // 3. CAREER JOBS (DATE BUG TEST)
  let createdJobId1 = "";
  let createdJobId2 = "";

  await check("CAREER JOB CREATE (EMPTY DEADLINE)", async () => {
    const res = await fetch(`${API_BASE}/api/career-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Test Physics Lecturer (Empty Deadline)",
        slug: `test-physics-lecturer-${Date.now()}`,
        department: "Science",
        employment_type: "Full-Time",
        location: "Bagalkot",
        application_deadline: "", // EMPTY STRING DATE BUG TEST
        status: "active",
        is_featured: true,
        display_order: 1,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) {
      throw new Error(`Job creation with empty deadline failed: ${json.error}`);
    }
    createdJobId1 = json.data.id;
    if (json.data.application_deadline !== null) {
      throw new Error(`Expected application_deadline to be null, got ${json.data.application_deadline}`);
    }
  });

  await check("CAREER JOB CREATE (VALID DEADLINE)", async () => {
    const res = await fetch(`${API_BASE}/api/career-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Test Biology Lecturer (Valid Deadline)",
        slug: `test-biology-lecturer-${Date.now()}`,
        department: "Science",
        employment_type: "Full-Time",
        location: "Bagalkot",
        application_deadline: "2026-12-31",
        status: "active",
        is_featured: false,
        display_order: 2,
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) {
      throw new Error(`Job creation with valid deadline failed: ${json.error}`);
    }
    createdJobId2 = json.data.id;
  });

  await check("CAREER JOB LIST (PUBLIC & ADMIN)", async () => {
    const pubRes = await fetch(`${API_BASE}/api/career-jobs`);
    const pubJson = await pubRes.json();
    if (!pubJson.success || !Array.isArray(pubJson.data)) {
      throw new Error(`Public career jobs list failed: ${pubJson.error}`);
    }

    const adminRes = await fetch(`${API_BASE}/api/career-jobs?admin=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminJson = await adminRes.json();
    if (!adminJson.success || !Array.isArray(adminJson.data)) {
      throw new Error(`Admin career jobs list failed: ${adminJson.error}`);
    }
  });

  // 4. CAREER APPLICATION & RESUME UPLOAD
  let uploadedResumeUrl = "";
  await check("CAREER APPLICATION (RESUME UPLOAD & SUBMISSION)", async () => {
    // 1. Upload Resume
    const fakePdfBase64 = "data:application/pdf;base64,JVBERi0xLjQKJSVFT0YK";
    const resumeRes = await fetch(`${API_BASE}/api/career-resumes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: { name: "test-resume.pdf", type: "application/pdf", size: 1024, data: fakePdfBase64 },
      }),
    });
    const resumeJson = await resumeRes.json();
    if (!resumeJson.success || !resumeJson.data?.url) {
      throw new Error(`Resume upload failed: ${resumeJson.error}`);
    }
    uploadedResumeUrl = resumeJson.data.url;

    // 2. Submit Application
    const appRes = await fetch(`${API_BASE}/api/career-applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: createdJobId1,
        full_name: "Audit Test Candidate",
        email: "candidate@example.com",
        mobile: "9876543210",
        qualification: "M.Sc Physics",
        resume_path: uploadedResumeUrl,
        resume_file_name: "test-resume.pdf",
        resume_file_size: 1024,
      }),
    });
    const appJson = await appRes.json();
    if (!appJson.success || !appJson.data?.application_ref) {
      throw new Error(`Career application submission failed: ${appJson.error}`);
    }
  });

  await check("CAREER APPLICATION LIST", async () => {
    const res = await fetch(`${API_BASE}/api/career-applications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(`Career applications list failed: ${json.error}`);
    }
  });

  // 5. ADMISSIONS
  let admissionAppId = "";
  await check("ADMISSIONS CREATE", async () => {
    const res = await fetch(`${API_BASE}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: "Audit Test Student",
        father_name: "Audit Father",
        mother_name: "Audit Mother",
        date_of_birth: "2008-05-15",
        gender: "Male",
        email: "student@example.com",
        mobile_number: "9988776655",
        course_interested: "PCMB",
        medium_of_instruction: "English",
        state: "Karnataka",
        city: "Bagalkot",
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.application_id) {
      throw new Error(`Admission submission failed: ${json.error}`);
    }
    admissionAppId = json.data.application_id;
  });

  await check("ADMISSIONS LIST", async () => {
    const res = await fetch(`${API_BASE}/api/admissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(`Admissions list failed: ${json.error}`);
    }
    const found = json.data.find((a) => a.application_id === admissionAppId);
    if (!found) throw new Error("Newly created admission record not found in admin list.");
  });

  // 6. GENERAL ENQUIRIES
  let enquiryId = "";
  await check("ENQUIRY CREATE", async () => {
    const res = await fetch(`${API_BASE}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Audit Enquiry Visitor",
        mobile: "9123456789",
        email: "visitor@example.com",
        course: "PCMC",
        message: "Requesting fee structure details.",
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) {
      throw new Error(`Enquiry submission failed: ${json.error}`);
    }
    enquiryId = json.data.id;
  });

  await check("ENQUIRY LIST", async () => {
    const res = await fetch(`${API_BASE}/api/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(`Enquiry list failed: ${json.error}`);
    }
    const found = json.data.find((e) => e.id === enquiryId);
    if (!found) throw new Error("Newly created enquiry not found in admin list.");
  });

  // 7. SITE CMS READ & UPDATE
  await check("SITE CMS READ & UPDATE", async () => {
    const getRes = await fetch(`${API_BASE}/api/site-cms/site_config`);
    const getJson = await getRes.json();
    if (!getJson.success) throw new Error(`Site CMS read failed: ${getJson.error}`);

    const existingVal = getJson.data?.value || {};
    const updatedVal = { ...existingVal, auditTestTimestamp: Date.now() };

    const putRes = await fetch(`${API_BASE}/api/site-cms/site_config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ value: updatedVal }),
    });
    const putJson = await putRes.json();
    if (!putJson.success) throw new Error(`Site CMS update failed: ${putJson.error}`);
  });

  // 8. MEDIA UPLOAD, READ, REPLACE & DELETE (PERSISTENT DB OBJECT STORAGE)
  let uploadedMediaId = "";
  let uploadedMediaUrl = "";

  await check("MEDIA UPLOAD (DATABASE STORAGE)", async () => {
    const fakeImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        category: "gallery",
        file: { name: "audit-test-image.png", type: "image/png", size: 100, data: fakeImageBase64 },
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.url || !json.data?.item?.id) {
      throw new Error(`Media upload failed: ${json.error}`);
    }
    uploadedMediaUrl = json.data.url;
    uploadedMediaId = json.data.item.id;
  });

  await check("MEDIA READ (FROM DATABASE)", async () => {
    const res = await fetch(`${API_BASE}${uploadedMediaUrl}`);
    if (res.status !== 200) {
      throw new Error(`Media read HTTP ${res.status}: ${res.statusText}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("image/png")) {
      throw new Error(`Expected image/png header, got ${contentType}`);
    }
  });

  await check("MEDIA REPLACE (DATABASE UPDATE)", async () => {
    const newImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const res = await fetch(`${API_BASE}/api/media/${uploadedMediaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        file: { name: "audit-replaced-image.png", type: "image/png", size: 120, data: newImageBase64 },
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) {
      throw new Error(`Media replace failed: ${json.error}`);
    }
  });

  await check("MEDIA DELETE (DATABASE CLEANUP)", async () => {
    const res = await fetch(`${API_BASE}/api/media/${uploadedMediaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Media delete failed: ${json.error}`);
    }
  });

  // 9. STABILITY LOAD TEST (100 CONCURRENT & SEQUENTIAL REQUESTS)
  await check("STABILITY LOAD TEST (100 REQUESTS)", async () => {
    const endpoints = [
      "/api/health",
      "/api/site-cms",
      "/api/career-jobs",
      "/api/chatbot-knowledge",
    ];
    const promises = [];
    for (let i = 0; i < 100; i++) {
      const ep = endpoints[i % endpoints.length];
      promises.push(fetch(`${API_BASE}${ep}`).then((res) => {
        if (res.status !== 200 && res.status !== 503) {
          throw new Error(`Request ${i} to ${ep} returned HTTP ${res.status}`);
        }
      }));
    }
    await Promise.all(promises);
  });

  console.log("\n==================================================");
  console.log("AUDIT SUMMARY MATRIX");
  console.log("==================================================");
  for (const [test, status] of Object.entries(results)) {
    console.log(`${test.padEnd(45)}: ${status}`);
  }
}

testAll().catch((err) => {
  console.error("Fatal audit runner error:", err);
  process.exit(1);
});
