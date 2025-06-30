import * as React from "react";
import { Arc, Group } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { ParentSize } from "@visx/responsive";
import { LinearGradient } from "@visx/gradient";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type DonutChartProps = {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  className?: string;
  interactive?: boolean;
  valueFormatter?: (value: number) => string;
};

// Define type for colorScale
type ColorScale = (label: string) => string;

const defaultValueFormatter = (value: number) => `${value.toLocaleString()}`;

// Static pie chart segment without animations
function StaticPieSegment({ 
  segment, 
  radius, 
  innerRadius, 
  colorScale, 
  handleClick,
  totalValue 
}: { 
  segment: { 
    label: string; 
    value: number; 
    startAngle: number; 
    endAngle: number; 
  };
  radius: number;
  innerRadius: number;
  colorScale: ColorScale;
  handleClick: (label: string, value: number) => void;
  totalValue: number;
}) {
  return (
    <React.Fragment>
      <LinearGradient
        key={`gradient-${segment.label}`}
        id={`gradient-${segment.label}`}
        from={colorScale(segment.label)}
        to={colorScale(segment.label)}
        fromOpacity={1}
        toOpacity={0.8}
      />
      <Arc
        outerRadius={radius}
        innerRadius={innerRadius}
        startAngle={segment.startAngle}
        endAngle={segment.endAngle}
        fill={
          totalValue === 0
            ? "#e2e8f0"
            : `url(#gradient-${segment.label})`
        }
        onClick={() => handleClick(segment.label, segment.value)}
        className={totalValue === 0 ? undefined : "cursor-pointer"}
      />
    </React.Fragment>
  );
}

// Main chart component
export function Chart({
  data = [],
  className,
  interactive = false,
  valueFormatter = defaultValueFormatter,
  ...props
}: DonutChartProps) {
  const { toast } = useToast();

  // Colors defined inside useMemo to avoid dependency issues
  const colorScale = React.useMemo(() => {
    const colors = [
      "#0091ff",
      "#8855ff",
      "#48bb78",
      "#38b2ac",
      "#4299e1",
      "#0fa5e9",
      "#ed64a6",
      "#667eea",
      "#f56565",
    ];
    
    return scaleOrdinal<string, string>({
      domain: data.map((d) => d.label),
      range: data.map((d, i) => d.color || colors[i % colors.length]),
    });
  }, [data]);

  const handleClick = (label: string, value: number) => {
    if (interactive) {
      toast({
        title: label,
        description: valueFormatter(value),
      });
    }
  };

  // Calculate total value
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  // Generate pie segments
  const segments = React.useMemo(() => {
    let currentAngle = 0;
    const result = data.map((entry) => {
      // If total is 0, create a full empty circle
      const startAngle = currentAngle;
      let endAngle;

      if (totalValue === 0) {
        endAngle = 2 * Math.PI;
      } else {
        const percentage = entry.value / totalValue;
        endAngle = currentAngle + percentage * 2 * Math.PI;
        currentAngle = endAngle;
      }

      return {
        ...entry,
        startAngle,
        endAngle,
      };
    });

    // If total is 0, return a single empty circle segment
    return totalValue === 0
      ? [{ label: "No data", value: 0, startAngle: 0, endAngle: 2 * Math.PI }]
      : result;
  }, [data, totalValue]);

  return (
    <div
      className={cn("w-full aspect-square relative", className)}
      {...props}
    >
      <ParentSize>
        {(parent) => {
          // Dimensions
          const radius = Math.min(parent.width, parent.height) / 2;
          const innerRadius = radius * 0.7;

          return (
            <svg width={parent.width} height={parent.height}>
              <Group top={parent.height / 2} left={parent.width / 2}>
                {segments.map((segment) => (
                  <StaticPieSegment
                    key={segment.label}
                    segment={segment}
                    radius={radius}
                    innerRadius={innerRadius}
                    colorScale={colorScale}
                    handleClick={handleClick}
                    totalValue={totalValue}
                  />
                ))}
              </Group>
            </svg>
          );
        }}
      </ParentSize>

      <div className="absolute inset-0 flex items-center justify-center flex-col">
        {totalValue === 0 ? (
          <p className="text-muted-foreground">No data</p>
        ) : (
          <React.Fragment>
            <p className="text-3xl font-bold">
              {valueFormatter(totalValue)}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </React.Fragment>
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-col space-y-2">
          {data.map((entry) => (
            <div key={entry.label} className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colorScale(entry.label) }}
                />
                <Label className="text-sm">{entry.label}</Label>
              </div>
              <span className="text-sm font-medium">
                {valueFormatter(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chart;