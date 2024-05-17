import { VNode } from "preact";
import { createRef } from "preact";
import { Component } from "preact";

export interface SelectorAttibutes<T> {
  options: T[];
  selected: T;
  placeholder?: string;
  is_loading?: boolean;
  to_string(v: T): string;
  render?: (_: T) => VNode;
  onOptionSelected(v: T): void;
}

export interface SelectorState {
  visible: boolean;
  value: string;
  is_focused: boolean;
}

export class Selector<T>
  extends Component<SelectorAttibutes<T>, SelectorState> {
  public state: SelectorState = {
    visible: false,
    value: "",
    is_focused: false,
  };

  private styleVisible = { display: "block" };
  private styleHidden = { display: "none" };
  private clickHandler = (e: Event) => this.onClickOutside(e);
  private ref = createRef<HTMLInputElement>();

  constructor() {
    super();
    this.checkMatch = this.checkMatch.bind(this);
    this.closeTooltip = this.closeTooltip.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);
    this.filterOptions = this.filterOptions.bind(this);
    this.getFilter = this.getFilter.bind(this);
    this.getMatcher = this.getMatcher.bind(this);
    this.selectOption = this.selectOption.bind(this);
    this.explicitSelection = this.explicitSelection.bind(this);
    this.enableFilter = this.enableFilter.bind(this);
  }

  public componentDidMount(): void {
    this.props.selected &&
      this.setState(() => ({
        value: this.props.to_string(this.props.selected),
      }));
  }

  private onClickOutside(e: Event): void {
    !this.base?.contains(e.target as Node) && this.closeTooltip();
  }

  private closeTooltip(opt?: T): void {
    this.setState(() => ({ visible: false }));
    globalThis.removeEventListener("click", this.clickHandler);
    if (opt) this.checkMatch(opt);
  }

  private checkMatch(opt: T): void {
    const match = this.props.options.find((v) => this.getMatcher(opt, v));
    if (!match) return;
    this.selectOption(match);
  }

  private getMatcher(opt: T, compare: T): boolean {
    return this.props.to_string(opt)
      .match(
        new RegExp(
          `^${
            this.props.to_string(compare).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          }$`,
          "i",
        ),
      ) != null;
  }

  private onFocusHandler(e: Event): void {
    (e.target as HTMLInputElement).select();
    this.setState(() => ({ visible: true, is_focused: true }));
    globalThis.addEventListener("click", this.clickHandler);
  }

  private filterOptions(e: Event): void {
    const { value } = e.target as HTMLInputElement;
    this.setState(() => ({ value }));
  }

  private getFilter(opt: T): boolean {
    return this.props.to_string(opt).match(new RegExp(this.state.value, "i")) !=
      null;
  }

  private selectOption(opt: T): void {
    this.props.onOptionSelected(opt);
  }

  private explicitSelection(opt: T): void {
    this.setState(() => ({ value: this.props.to_string(opt) }));
    this.closeTooltip(opt);
  }

  private enableFilter(e: Event) {
    const el = e.target as HTMLInputElement;
    this.setState({ is_focused: false });
  }

  private loader = (
    <div class={"flex justify-center"}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 animate-spin"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </div>
  );

  public render() {
    return (
      this.props.is_loading ? this.loader : (
        <div data-selector-container>
          <div data-selector-display>
            <input
              onFocus={this.onFocusHandler}
              onInput={this.filterOptions}
              value={this.state.value}
              placeholder={this.props.placeholder}
              class={"min-w-sm w-full border rounded p-1"}
              ref={this.ref}
              onKeyUp={this.enableFilter}
            />
          </div>
          <div
            data-selector-tooltip
            style={{
              ...(this.state.visible ? this.styleVisible : this.styleHidden),
              width: this.ref.current
                ? `${this.ref.current!.getBoundingClientRect().width}px`
                : "",
            }}
            class={"absolute max-h-[80vh] overflow-y-scroll border rounded p-2 bg-white"}
          >
            {this.props.options
              .filter((opt) =>
                this.state.is_focused ||
                !this.state.value ||
                this.getFilter(opt)
              )
              .map((opt) => (
                <div
                  data-selector-option
                  onClick={() => this.explicitSelection(opt)}
                  class={"px-1"}
                >
                  <span>
                    {this.props.render
                      ? this.props.render(opt)
                      : this.props.to_string(opt)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )
    );
  }
}
