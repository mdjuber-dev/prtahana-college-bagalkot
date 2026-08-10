// vite.config.ts
import { defineConfig } from "file:///C:/Users/zubar/Downloads/project-bolt-sb1-hiv7ctrr%20(2)/pratharna-clg-bgk/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/zubar/Downloads/project-bolt-sb1-hiv7ctrr%20(2)/pratharna-clg-bgk/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/zubar/Downloads/project-bolt-sb1-hiv7ctrr%20(2)/pratharna-clg-bgk/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "framer-motion": ["framer-motion"],
          icons: ["lucide-react"],
          "pdf-vendor": ["jspdf", "qrcode"],
          "confetti": ["canvas-confetti"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx6dWJhclxcXFxEb3dubG9hZHNcXFxccHJvamVjdC1ib2x0LXNiMS1oaXY3Y3RyciAoMilcXFxccHJhdGhhcm5hLWNsZy1iZ2tcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHp1YmFyXFxcXERvd25sb2Fkc1xcXFxwcm9qZWN0LWJvbHQtc2IxLWhpdjdjdHJyICgyKVxcXFxwcmF0aGFybmEtY2xnLWJna1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvenViYXIvRG93bmxvYWRzL3Byb2plY3QtYm9sdC1zYjEtaGl2N2N0cnIlMjAoMikvcHJhdGhhcm5hLWNsZy1iZ2svdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAnZnJhbWVyLW1vdGlvbic6IFsnZnJhbWVyLW1vdGlvbiddLFxuICAgICAgICAgIGljb25zOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgICdwZGYtdmVuZG9yJzogWydqc3BkZicsICdxcmNvZGUnXSxcbiAgICAgICAgICAnY29uZmV0dGknOiBbJ2NhbnZhcy1jb25mZXR0aSddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdaLFNBQVMsb0JBQW9CO0FBQ3JiLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWUsV0FBVztBQUZnTyxJQUFNLDJDQUEyQztBQUlwVCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxpQkFBaUIsQ0FBQyxlQUFlO0FBQUEsVUFDakMsT0FBTyxDQUFDLGNBQWM7QUFBQSxVQUN0QixjQUFjLENBQUMsU0FBUyxRQUFRO0FBQUEsVUFDaEMsWUFBWSxDQUFDLGlCQUFpQjtBQUFBLFFBQ2hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
