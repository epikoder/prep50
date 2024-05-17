import { JSX } from "preact";
import { cloneElement } from "preact";
import { Fragment } from "preact";
import { VNode } from "preact";
import { Component } from "preact";
import "preact/debug";

interface DraggableProps<T> {
  items: T[];
  children: (_: T, __: number) => VNode;
  onDragComplete: (_: T[]) => void;
}

interface DraggableState {
  dragging: boolean;
  draggable: number;
  dragged: number;
  over: number;
}

export default class Draggable<T>
  extends Component<DraggableProps<T>, DraggableState> {
  constructor() {
    super();
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.dragOver = this.dragOver.bind(this);
    this.drop = this.drop.bind(this);
  }

  state: DraggableState = {
    dragging: false,
    draggable: -1,
    dragged: -1,
    over: -1,
  };

  onMouseDown(idx: number) {
    this.setState({
      draggable: idx,
    });
  }

  onMouseUp() {
    this.setState({
      draggable: -1,
    });
  }

  dragStart(idx: number, e: JSX.TargetedDragEvent<HTMLElement>) {
    if (e.currentTarget.getAttribute("draggable") === "false") {
      return;
    }

    e.dataTransfer!.setData(
      "application/json",
      JSON.stringify(this.props.items[idx]),
    );
    e.dataTransfer!.effectAllowed = "move";

    this.setState({
      dragging: true,
      dragged: idx,
      over: idx,
    });
  }
  dragEnd(idx: number, e: JSX.TargetedDragEvent<HTMLElement>) {
    this.setState({
      dragging: false,
      draggable: -1,
      dragged: -1,
      over: -1,
    });
  }
  dragOver(idx: number, e: JSX.TargetedDragEvent<HTMLElement>) {
    this.setState({
      over: idx,
    });

    if (idx === this.state.dragged) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
  }
  drop(idx: number, e: JSX.TargetedDragEvent<HTMLElement>) {
    const { dragged } = this.state;

    if (dragged === idx) return;

    const newItems = this.props.items.slice();

    newItems.splice(idx, 0, newItems.splice(dragged, 1)[0]);

    this.props.onDragComplete(newItems);
  }

  render() {
    const newItems =
      this.state.dragging && this.state.over !== this.state.dragged
        ? this.props.items.slice()
        : this.props.items;

    if (this.state.dragging && this.state.over !== this.state.dragged) {
      newItems.splice(
        this.state.over,
        0,
        newItems.splice(this.state.dragged, 1)[0],
      );
    }

    return (
      <div aria-dropeffect="move">
        {newItems.map((item, idx) => (
          <Item
            key={idx}
            onMouseDown={this.onMouseDown.bind(this, idx)}
            onMouseUp={this.onMouseUp.bind(this)}
            draggable={this.state.draggable === idx}
            over={this.state.dragging && idx === this.state.over}
            onDragStart={this.dragStart.bind(this, idx)}
            onDragEnd={this.dragEnd.bind(this, idx)}
            onDragOver={this.dragOver.bind(this, idx)}
            onDrop={this.drop.bind(this, idx)}
            role="option"
            aria-grabbed={this.state.dragging && idx === this.state.over}
            dragged={this.state.dragged == idx}
            render={this.props.children(item, idx)}
          />
        ))}
      </div>
    );
  }
}

// Draggable.defaultProps = {
//   container: ({ children, ...props }) => <ul {...props}>{children}</ul>,
//   item: ({ data }) => <li>{JSON.stringify(data)}</li>,
//   onSort: () => {},
//   onSwap: (from, to) => {},
//   prop: "id",
// };

function Item<T>(
  { data, dragged, over, render, handle, ...props }:
    & JSX.HTMLAttributes<HTMLLIElement>
    & {
      dragged: boolean;
      over: boolean;
      render: VNode;
      handle?: VNode;
    },
) {
  return (
    <li
      style={{ "-webkit-user-drag": "element" }}
      class={`draggable-item ${over ? "over" : ""}`}
      {...props}
    >
      {handle}
      {cloneElement(render, {
        style: {
          "width": "100%",
        },
      })}
    </li>
  );
}
