import React from "react";
import DayListItem from "components/DayListItem";

export default function DayList(props) {
  const DayListItems = props.days.map(item => {
    const data = {
      key: item.id,
      name: item.name,
      spots: item.spots,
      selected: item.name === props.day,
      setDay: props.setDay,
    }
    return <DayListItem {...data}></DayListItem>;
  });
  return (
    <ul>{DayListItems}</ul>
  );
}