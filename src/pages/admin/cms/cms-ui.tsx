import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Trash2, Plus } from 'lucide-react';
import { getMediaUrl } from '@/lib/media-url';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border shadow-soft p-6 space-y-4">
      <h3 className="text-lg font-bold text-secondary-900 border-b pb-3">{title}</h3>
      {children}
    </section>
  );
}

export function TextField({ label, value, onChange, textarea = false, type = 'text' }: {
  label: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-secondary-700">{label}</span>
      {textarea ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1.5 p-3 border rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
      ) : (
        <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="mt-1.5 p-3 border rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
      )}
    </label>
  );
}

export function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-secondary-800">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded" />
      {label}
    </label>
  );
}

export function ImageField({ label, value, onUpload }: { label: string; value?: string; onUpload: (file?: File | null) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-secondary-700">{label}</span>
      <div className="mt-2 flex gap-3 items-center">
        {value && <img src={getMediaUrl(value)} alt="" className="w-14 h-14 object-cover rounded-xl border shadow-sm" />}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onUpload(e.target.files?.[0])} className="text-xs text-secondary-600 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-800 file:font-bold hover:file:bg-primary-100" />
      </div>
      {value && <input value={value} readOnly className="mt-2 p-2 border rounded-lg w-full text-xs bg-secondary-50 font-mono text-secondary-600" />}
    </label>
  );
}

export function ReorderButtons({ onUp, onDown, disableUp, disableDown }: {
  onUp: () => void; onDown: () => void; disableUp?: boolean; disableDown?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <button type="button" onClick={onUp} disabled={disableUp} className="p-1 border rounded hover:bg-secondary-50 disabled:opacity-30" aria-label="Move up"><ChevronUp size={14} /></button>
      <button type="button" onClick={onDown} disabled={disableDown} className="p-1 border rounded hover:bg-secondary-50 disabled:opacity-30" aria-label="Move down"><ChevronDown size={14} /></button>
    </div>
  );
}

export function CopyUrlButton({ url, copiedUrl, onCopy }: { url: string; copiedUrl: string | null; onCopy: (url: string) => void }) {
  return (
    <button type="button" onClick={() => onCopy(url)} className="py-1.5 px-2 border rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-secondary-50">
      {copiedUrl === url ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copiedUrl === url ? 'Copied' : 'Copy URL'}
    </button>
  );
}

export function DeleteButton({ onClick, label = 'Delete' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold">
      <Trash2 size={12} /> {label}
    </button>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="px-4 py-2 bg-primary-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5">
      <Plus size={14} /> {label}
    </button>
  );
}

export function setPath(source: Record<string, any>, path: string, value: any) {
  const next = structuredClone(source || {});
  const parts = path.split('.');
  let cursor = next;
  parts.slice(0, -1).forEach((part) => {
    cursor[part] = cursor[part] || {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
  return next;
}

export function reorderList<T extends { display_order: number }>(items: T[], index: number, direction: 'up' | 'down'): T[] {
  const next = [...items];
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= next.length) return next;
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next.map((item, i) => ({ ...item, display_order: i + 1 }));
}

export function LeaderEditor({ title, prefix, data, setValue, upload }: {
  title: string; prefix: string; data: Record<string, any>;
  setValue: (path: string, value: any) => void; upload: (path: string, file?: File | null) => void;
}) {
  const profile = prefix.split('.').reduce((obj: any, key) => obj?.[key], data) || {};
  return (
    <div className="rounded-2xl border p-5 space-y-4 bg-secondary-50/50">
      <h4 className="font-bold text-primary-950 text-base">{title}</h4>
      <TextField label="Full Name" value={profile.name} onChange={(v) => setValue(`${prefix}.name`, v)} />
      <TextField label="Designation" value={profile.designation} onChange={(v) => setValue(`${prefix}.designation`, v)} />
      <TextField label="Qualification" value={profile.qualification || ''} onChange={(v) => setValue(`${prefix}.qualification`, v)} />
      <TextField label="Department" value={profile.department || ''} onChange={(v) => setValue(`${prefix}.department`, v)} />
      <TextField label="Bio / Message" value={profile.message || profile.bio || ''} onChange={(v) => setValue(`${prefix}.message`, v)} textarea />
      <ImageField label="Profile Photo" value={profile.photo} onUpload={(file) => upload(`${prefix}.photo`, file)} />
      <ToggleField label="Active / Visible" checked={profile.is_active !== false} onChange={(v) => setValue(`${prefix}.is_active`, v)} />
    </div>
  );
}
