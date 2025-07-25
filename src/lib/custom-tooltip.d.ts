import type { TooltipIndex } from "recharts/types/state/tooltipSlice";

type PropertiesReadFromContext = 'viewBox' | 'active' | 'coordinate' | 'accessibilityLayer';
export type CustomTooltipProps<TValue extends ValueType, TName extends NameType> = Omit<DefaultTooltipContentProps<TValue, TName>, PropertiesReadFromContext> & {
    /**
     * If true, then Tooltip is always displayed, once an activeIndex is set by mouse over, or programmatically.
     * If false, then Tooltip is never displayed.
     * If active is undefined, Recharts will control when the Tooltip displays. This includes mouse and keyboard controls.
     */
    active?: boolean;
    /**
     * If true, then Tooltip will information about hidden series (defaults to false).
     * Interacting with the hide property of Area, Bar, Line, Scatter.
     *
     * default: false
     */
    includeHidden?: boolean | undefined;
    allowEscapeViewBox?: AllowInDimension;
    animationDuration?: AnimationDuration;
    animationEasing?: AnimationTiming;
    content?: ContentType<TValue, TName>;
    cursor?: CursorDefinition;
    filterNull?: boolean;
    defaultIndex?: number | TooltipIndex;
    isAnimationActive?: boolean;
    offset?: number;
    payloadUniqBy?: UniqueOption<Payload<TValue, TName>>;
    /**
     * If portal is defined, then Tooltip will use this element as a target
     * for rendering using React Portal: https://react.dev/reference/react-dom/createPortal
     *
     * If this is undefined then Tooltip renders inside the recharts-wrapper element.
     */
    portal?: HTMLElement | null;
    position?: Partial<Coordinate>;
    reverseDirection?: AllowInDimension;
    /**
     * If true, tooltip will appear on top of all bars on an axis tick.
     * If false, tooltip will appear on individual bars.
     * Currently only supported in BarChart and RadialBarChart.
     * If undefined then defaults to true.
     */
    shared?: boolean;
    /**
     * If `hover` then the Tooltip shows on mouse enter and hides on mouse leave.
     *
     * If `click` then the Tooltip shows after clicking and stays active.
     *
     * Default `hover`
     */
    trigger?: TooltipTrigger;
    useTranslate3d?: boolean;
    wrapperStyle?: CSSProperties;
    /**
     * Tooltip always attaches itself to the "Tooltip" axis. Which axis is it? Depends on the layout:
     * - horizontal layout -> X axis
     * - vertical layout -> Y axis
     * - radial layout -> radial axis
     * - centric layout -> angle axis
     *
     * Tooltip will use the default axis for the layout, unless you specify an axisId.
     */
    axisId?: AxisId;
};
export declare function CustomTooltip<TValue extends ValueType, TName extends NameType>(outsideProps: CustomTooltipProps<TValue, TName>): React.JSX.Element;
