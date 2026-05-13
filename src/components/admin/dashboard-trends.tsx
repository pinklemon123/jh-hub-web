const trends = [
  { label: "举报趋势", value: "12", change: "+18%" },
  { label: "私信风险", value: "7", change: "+9%" },
  { label: "联系方式命中", value: "5", change: "-4%" },
  { label: "新号高频发帖", value: "3", change: "+6%" }
];

export function DashboardTrends() {
  return (
    <section className="mt-6 rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div>
        <h2 className="font-black">风险趋势</h2>
        <p className="mt-1 text-sm text-neutral-500">第一版先用运营指标占位，后续接真实统计表。</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {trends.map((trend) => (
          <article key={trend.label} className="rounded-lg border border-line bg-paper p-4">
            <div className="text-xs font-black text-neutral-500">{trend.label}</div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-2xl font-black">{trend.value}</span>
              <span className="text-xs font-bold text-brand-700">{trend.change}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
