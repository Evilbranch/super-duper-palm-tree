import { useState } from 'react';

export default function SettingsPage() {
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [dailyReminderTime, setDailyReminderTime] = useState('08:00');

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h2 className="text-lg font-semibold">设置</h2>

      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">番茄钟时长</p>
            <p className="text-xs text-slate-500">默认专注时长（分钟）</p>
          </div>
          <input
            type="number"
            min={5}
            max={60}
            value={pomodoroMinutes}
            onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">每日复盘提醒</p>
            <p className="text-xs text-slate-500">推送复盘通知的时间</p>
          </div>
          <input
            type="time"
            value={dailyReminderTime}
            onChange={(e) => setDailyReminderTime(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="mb-1 text-sm font-medium">数据存储</h3>
        <p className="text-xs text-slate-500">
          所有数据存储在浏览器 IndexedDB 中，不会上传到任何服务器。
          清除浏览器数据将导致数据丢失，建议定期导出备份。
        </p>
      </div>
    </div>
  );
}
