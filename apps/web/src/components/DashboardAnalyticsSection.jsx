const chartColors = ["#0f766e", "#1d4ed8", "#ea580c", "#e11d48", "#16a34a", "#475569"];

const numberFormatter = new Intl.NumberFormat("en-IN");

const formatCount = (value) => numberFormatter.format(value || 0);

const buildPolylinePoints = (items, key, dimensions) => {
  const { width, height, paddingX, paddingTop, paddingBottom } = dimensions;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(1, ...items.map((item) => item[key]));

  return items
    .map((item, index) => {
      const x = paddingX + (innerWidth * index) / Math.max(items.length - 1, 1);
      const y = paddingTop + innerHeight - (item[key] / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
};

const LineChartCard = ({ trend }) => {
  const dimensions = {
    width: 720,
    height: 280,
    paddingX: 42,
    paddingTop: 20,
    paddingBottom: 42
  };
  const maxValue = Math.max(
    1,
    ...trend.items.map((item) => Math.max(item.dispatched, item.returned))
  );
  const innerHeight = dimensions.height - dimensions.paddingTop - dimensions.paddingBottom;
  const gridValues = Array.from({ length: 5 }, (_, index) =>
    Math.round((maxValue * (4 - index)) / 4)
  );
  const dispatchPoints = buildPolylinePoints(trend.items, "dispatched", dimensions);
  const returnPoints = buildPolylinePoints(trend.items, "returned", dimensions);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sales analysis
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            Dispatch vs returns trend ({trend.windowDays} days)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
            Dispatched: {formatCount(trend.totals.dispatched)}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            Returned: {formatCount(trend.totals.returned)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Net outflow: {formatCount(trend.totals.net)}
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="h-[260px] min-w-[640px] w-full"
          role="img"
          aria-label="Dispatch and returns line chart"
        >
          {gridValues.map((value, index) => {
            const y =
              dimensions.paddingTop + (innerHeight * index) / Math.max(gridValues.length - 1, 1);

            return (
              <g key={value + index}>
                <line
                  x1={dimensions.paddingX}
                  y1={y}
                  x2={dimensions.width - dimensions.paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 6"
                />
                <text
                  x={dimensions.paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[12px]"
                >
                  {formatCount(value)}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="#0f766e"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={dispatchPoints}
          />
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={returnPoints}
          />

          {trend.items.map((item, index) => {
            const x =
              dimensions.paddingX +
              ((dimensions.width - dimensions.paddingX * 2) * index) /
                Math.max(trend.items.length - 1, 1);
            const dispatchY =
              dimensions.paddingTop +
              innerHeight -
              (item.dispatched / maxValue) * innerHeight;
            const returnY =
              dimensions.paddingTop + innerHeight - (item.returned / maxValue) * innerHeight;

            return (
              <g key={item.date}>
                <circle cx={x} cy={dispatchY} r="4" fill="#0f766e" />
                <circle cx={x} cy={returnY} r="4" fill="#f59e0b" />
                {index % 2 === 0 || index === trend.items.length - 1 ? (
                  <text
                    x={x}
                    y={dimensions.height - 12}
                    textAnchor="middle"
                    className="fill-slate-400 text-[12px]"
                  >
                    {item.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
          Outgoing sale/dispatch quantity
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Stock added back from returns/exchanges
        </span>
      </div>
    </section>
  );
};

const TopProductsCard = ({ topProducts }) => {
  const items = topProducts.items;
  const maxQuantity = Math.max(1, ...items.map((item) => item.quantity));

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Top products ({topProducts.windowDays} days)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Best-selling products based on dispatch quantity.
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
            <div key={`${item.sku}-${item.name}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCount(item.quantity)}</p>
                  <p className="text-sm text-slate-500">{item.share}% share</p>
                </div>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-100">
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

const DonutChartCard = ({ title, description, items, total, emptyLabel }) => {
  const chartItems = items.filter((item) => item.quantity > 0);
  const circumference = 2 * Math.PI * 42;
  let cumulativeOffset = 0;

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      {chartItems.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="mx-auto w-full max-w-[180px] shrink-0">
            <svg viewBox="0 0 120 120" className="h-44 w-44">
              <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="14" />
              {chartItems.map((item, index) => {
                const segmentLength = (item.quantity / total) * circumference;
                const segment = (
                  <circle
                    key={`${item.label}-${item.type || item.name}`}
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke={chartColors[index % chartColors.length]}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={-cumulativeOffset}
                    transform="rotate(-90 60 60)"
                  />
                );

                cumulativeOffset += segmentLength;
                return segment;
              })}
              <text x="60" y="56" textAnchor="middle" className="fill-slate-400 text-[11px] uppercase">
                Total
              </text>
              <text x="60" y="72" textAnchor="middle" className="fill-slate-900 text-[18px] font-semibold">
                {formatCount(total)}
              </text>
            </svg>
          </div>

          <div className="w-full space-y-3">
            {chartItems.map((item, index) => (
              <div
                key={`${item.label}-${item.type || item.name}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.label || item.name}</p>
                      <p className="text-sm text-slate-500">{item.share}% of total</p>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">{formatCount(item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export const DashboardAnalyticsSection = ({ analytics }) => {
  if (!analytics) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <LineChartCard trend={analytics.movementTrend} />

      <div className="space-y-4">
        <TopProductsCard topProducts={analytics.topProducts} />
        <DonutChartCard
          title={`Returns mix (${analytics.returnBreakdown.windowDays} days)`}
          description="Quick view of how inbound stock is split between returns and exchanges."
          items={analytics.returnBreakdown.items}
          total={analytics.returnBreakdown.totalQuantity}
          emptyLabel="No returns or exchanges logged for this period."
        />
      </div>
    </div>
  );
};
