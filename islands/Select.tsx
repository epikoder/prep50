// deno-lint-ignore-file
/**
 *       <MySelector
 *          options={exampleArr}
 *          printBy="name"
 *          selected={this.selectedOpt}
 *          onOptionSelected={(opt) =>
 *           this.mySelectorValueChange(opt)}
 *         />
 */
import { Component } from "preact";

export interface SelectorAttibutes {
  options: any[];
  selected: any;
  printBy: string;
  onOptionSelected: (any: any) => void;
}

export interface SelectorState {
  visible: boolean;
  value: string;
}

// <MySelector onOptionSelected={updateProp} options={arr} printBy="name" trackBy="id"/>
export class Selector extends Component<SelectorAttibutes, SelectorState> {
  public state = { visible: false, value: "" };
  private styleVisible = { display: "block" };
  private styleHidden = { display: "none" };
  private clickHandler = (e: Event) => this.onClickOutside(e);

  public componentDidMount(): void {
    this.props.selected &&
      this.setState(() => ({ value: this.props.selected[this.props.printBy] }));
  }

  private onClickOutside(e: Event): void {
    !this.base?.contains(e.target as Node) && this.closeTooltip();
  }

  private closeTooltip(): void {
    this.setState(() => ({ visible: false }));
    globalThis.removeEventListener("click", this.clickHandler);
    this.checkMatch();
  }

  private checkMatch(): void {
    const match = this.props.options.find((opt) => this.getMatcher(opt));
    !match ? this.selectOption(match) : this.setState(() => ({ value: "" }));
  }

  private onFocusHandler(e: Event): void {
    (e.target as any).select();
    this.setState(() => ({ visible: true }));
    globalThis.addEventListener("click", this.clickHandler);
  }

  private filterOptions(e: Event): void {
    const { value } = e.target as any;
    this.setState(() => ({ value }));
  }

  private getFilter(opt: any): boolean {
    return opt[this.props.printBy].match(new RegExp(this.state.value, "i"));
  }

  private getMatcher(opt: any): boolean {
    return opt[this.props.printBy].match(
      new RegExp(`^${this.state.value}$`, "i"),
    );
  }

  private selectOption(opt: any): void {
    this.props.onOptionSelected.call(null, opt);
  }

  private explicitSelection(opt: any): void {
    this.setState(() => ({ value: opt[this.props.printBy] }));
    this.closeTooltip();
  }

  //   :host {
  //     background-color: buttonface;
  //     display: inline-block;
  //     align-items: center;
  //     border-radius: 0px;
  //     border-color: lightgrey;
  //   }

  //   [data-selector-option]:hover {
  //     cursor: pointer;
  //     color: white;
  //     background-color: grey;
  //   }
  public render() {
    return (
      <div data-selector-container class={""}>
        <div data-selector-display>
          <input
            onFocus={(e) => this.onFocusHandler(e)}
            onInput={(e) => this.filterOptions(e)}
            value={this.state.value}
          />
        </div>
        <div
          data-selector-tooltip
          style={this.state.visible ? this.styleVisible : this.styleHidden}
        >
          {this.props.options
            .filter((opt) => !this.state.value || this.getFilter(opt))
            .map((opt) => (
              <div
                data-selector-option
                onClick={() => this.explicitSelection(opt)}
              >
                <span>{opt[this.props.printBy]}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }
}
