import { useEffect, useMemo, useState } from "react";

const chartColors = ["#0f766e", "#1d4ed8", "#ea580c", "#e11d48", "#16a34a", "#475569"];
const trendChart = {
  width: 720,
  height: 280,
  paddingX: 34,
  paddingTop: 18,
  paddingBottom: 42
};

const numberFormatter = new Intl.NumberFormat("en-IN");

const formatCount = (value) => numberFormatter.format(value || 0);

const getDefaultTrendIndex = (items) => {
  const lastActiveIndex = items.findLastIndex(
    (item) => item.dispatched > 0 || item.returned > 0
  );

  return lastActiveIndex >= 0 ? lastActiveIndex : Math.max(items.length - 1, 0);
};

const getChartPoints = (items, key, maxValue) => {
  const innerWidth = trendChart.width - trendChart.paddingX * 2;
  const innerHeight = trendChart.height - trendChart.paddingTop - trendChart.paddingBottom;

  return items.map((item, index) => {
    const x = trendChart.paddingX + (innerWidth * index) / Math.max(items.length - 1, 1);
    const y =
      trendChart.paddingTop +
      innerHeight -
      (Math.max(item[key], 0) / Math.max(maxValue, 1)) * innerHeight;

    return { x, y, item, index };
  });
};

const getLinePath = (points) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

const getAreaPath = (points) => {
  const baseline = trendChart.height - trendChart.paddingBottom;

  return [
    `M ${points[0].x} ${baseline}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${baseline}`,
    "Z"
  ].join(" ");
};

const SummaryPill = ({ label, value, tone = "text-slate-900", background = "bg-slate-100" }) => (
  <div className={`rounded-2xl px-4 py-3 ${background}`}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-extrabold ${tone}`}>{value}</p>
  </div>
);

const TrendCard = ({ trend }) => {
  const [selectedIndex, setSelectedIndex] = useState(getDefaultTrendIndex(trend.items));
  const maxValue = Math.max(
    1,
    ...trend.items.map((item) => Math.max(item.dispatched, item.returned))
  );
  const dispatchedPoints = useMemo(
    () => getChartPoints(trend.items, "dispatched", maxValue),
    [trend.items, maxValue]
  );
  const returnedPoints = useMemo(
    () => getChartPoints(trend.items, "returned", maxValue),
    [trend.items, maxValue]
  );
  const gridValues = Array.from({ length: 5 }, (_, index) =>
    Math.round((maxValue * (4 - index)) / 4)
  );

  useEffect(() => {
    setSelectedIndex(getDefaultTrendIndex(trend.items));
  }, [trend]);

  const selectedItem = trend.items[selectedIndex] || trend.items[trend.items.length - 1];
  const selectedNet = selectedItem.dispatched - selectedItem.returned;
  const selectedDispatchPoint = dispatchedPoints[selectedIndex] || dispatchedPoints[dispatchedPoints.length - 1];
  const selectedReturnPoint = returnedPoints[selectedIndex] || returnedPoints[returnedPoints.length - 1];

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sales analysis
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            Dispatch vs returns ({trend.windowDays} days)
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Tap or hover a day to inspect outgoing sales and stock added back.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryPill
            label="Dispatched"
            value={formatCount(trend.totals.dispatched)}
            tone="text-teal-700"
            background="bg-teal-50"
          />
          <SummaryPill
            label="Returned"
            value={formatCount(trend.totals.returned)}
            tone="text-amber-700"
            background="bg-amber-50"
          />
          <SummaryPill
            label="Net outflow"
            value={formatCount(trend.totals.net)}
            tone="text-slate-900"
            background="bg-slate-100"
          />
        </div>
      </div>

        <div className="mt-5 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Selected day
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">{selectedItem.label}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <SummaryPill
              label="Dispatch"
              value={formatCount(selectedItem.dispatched)}
              tone="text-teal-700"
              background="bg-white"
            />
            <SummaryPill
              label="Returns"
              value={formatCount(selectedItem.returned)}
              tone="text-amber-700"
              background="bg-white"
            />
            <SummaryPill
              label="Net"
              value={formatCount(selectedNet)}
              tone="text-slate-900"
              background="bg-white"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${trendChart.width} ${trendChart.height}`}
              className="h-[260px] w-full"
              role="img"
              aria-label="Dispatch and returns interactive line chart"
            >
              <defs>
                <linearGradient id="dispatchAreaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="returnsAreaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {gridValues.map((value, index) => {
                const y =
                  trendChart.paddingTop +
                  ((trendChart.height - trendChart.paddingTop - trendChart.paddingBottom) * index) /
                    Math.max(gridValues.length - 1, 1);

                return (
                  <g key={`${value}-${index}`}>
                    <line
                      x1={trendChart.paddingX}
                      y1={y}
                      x2={trendChart.width - trendChart.paddingX}
                      y2={y}
                      stroke="#dbe4ee"
                      strokeDasharray="4 6"
                    />
                    <text
                      x={trendChart.paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[12px]"
                    >
                      {formatCount(value)}
                    </text>
                  </g>
                );
              })}

              <path d={getAreaPath(dispatchedPoints)} fill="url(#dispatchAreaGradient)" />
              <path d={getAreaPath(returnedPoints)} fill="url(#returnsAreaGradient)" />

              <path
                d={getLinePath(dispatchedPoints)}
                fill="none"
                stroke="#0f766e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={getLinePath(returnedPoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <line
                x1={selectedDispatchPoint.x}
                y1={trendChart.paddingTop}
                x2={selectedDispatchPoint.x}
                y2={trendChart.height - trendChart.paddingBottom}
                stroke="#94a3b8"
                strokeDasharray="4 6"
              />

              {dispatchedPoints.map((point, index) => {
                const isSelected = index === selectedIndex;
                const pairedReturnPoint = returnedPoints[index];

                return (
                  <g key={point.item.date}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isSelected ? "7" : "5"}
                      fill="#ffffff"
                      stroke="#0f766e"
                      strokeWidth="3"
                    />
                    <circle
                      cx={pairedReturnPoint.x}
                      cy={pairedReturnPoint.y}
                      r={isSelected ? "7" : "5"}
                      fill="#ffffff"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <circle
                      cx={point.x}
                      cy={(point.y + pairedReturnPoint.y) / 2}
                      r="18"
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => setSelectedIndex(index)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    />
                    {(index % 2 === 0 || index === dispatchedPoints.length - 1) ? (
                      <text
                        x={point.x}
                        y={trendChart.height - 12}
                        textAnchor="middle"
                        className={`text-[12px] ${isSelected ? "fill-slate-900" : "fill-slate-400"}`}
                      >
                        {point.item.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {trend.items.map((item, index) => {
            const selected = index === selectedIndex;

            return (
              <button
                key={item.date}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
            Dispatch
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Returns / exchanges
          </span>
        </div>
      </div>
    </section>
  );
};

const TopProductsCard = ({ topProducts }) => {
  const items = topProducts.items;
  const maxQuantity = Math.max(1, ...items.map((item) => item.quantity));

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Top products ({topProducts.windowDays} days)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Best-performing products by dispatch quantity.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {formatCount(topProducts.totalQuantity)} units
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No dispatch history yet for this period.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item, index) => (
            <div key={`${item.sku}-${item.name}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCount(item.quantity)}</p>
                  <p className="text-sm text-slate-500">{item.share}% share</p>
                </div>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.max((item.quantity / maxQuantity) * 100, 8)}%`,
                    backgroundColor: chartColors[index % chartColors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const ReturnsMixCard = ({ returnBreakdown }) => {
  const items = returnBreakdown.items.filter((item) => item.quantity > 0);
  const segments = items.length > 0 ? items : returnBreakdown.items;
  const total = returnBreakdown.totalQuantity;

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Returns mix ({returnBreakdown.windowDays} days)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Inbound stock split between returns and exchanges.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {formatCount(total)} total
        </span>
      </div>

      {total === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No returns or exchanges logged for this period.
        </div>
      ) : (
        <>
          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
            {segments.map((item, index) => (
              <div
                key={item.type}
                style={{
                  width: `${item.share}%`,
                  backgroundColor: chartColors[index % chartColors.length]
                }}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {segments.map((item, index) => (
              <div key={item.type} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.share}% of total</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCount(item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export const DashboardAnalyticsSection = ({ analytics }) => {
  const normalizedAnalytics = useMemo(() => analytics, [analytics]);

  if (!normalizedAnalytics) {
    return null;
  }

  return (
    <div className="space-y-4">
      <TrendCard trend={normalizedAnalytics.movementTrend} />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <TopProductsCard topProducts={normalizedAnalytics.topProducts} />
        <ReturnsMixCard returnBreakdown={normalizedAnalytics.returnBreakdown} />
      </div>
    </div>
  );
};
