import React from "react";
import DayListItem from "components/DayListItem";

export default function DayList(props) {
  const DayListItems = props.days.map(day => {
    const data = {
      key: day.id,
      name: day.name,
      spots: day.spots,
      selected: day.name === props.value,
      setDay: props.onChange,
    }
    return <DayListItem {...data}></DayListItem>;
  });
  return (
    <ul>{DayListItems}</ul>
  );
}