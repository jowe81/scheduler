import React from "react";
import classNames from "classnames";
import "components/DayListItem.scss";

export default function DayListItem(props) {
  const dayClass = classNames("day-list__item", {
    "day-list__item--selected": props.selected,
    "day-list__item--full": !props.spots,
  });
  let spotsText = `${props.spots} spots`;
  if (props.spots === 1) {
    spotsText = `1 spot`;
  } else if (props.spots === 0) {
    spotsText = `no spots`;
  }
  return (    
    <li className={dayClass} onClick={() => props.setDay(props.name)}>
      <h2 className="text--regular">{props.name}</h2> 
      <h3 className="text--light">{spotsText} remaining</h3>
    </li>
  );
}