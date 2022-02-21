import React from "react";
import classNames from "classnames";

export default function InterviewerListItem(props) {
  const classes = classNames("interviewers__item");
  return (
    <li className={classes}>
      <img
        className="interviewers__item-image"
        src={props.avatar}
        alt={props.name}
      />
      {props.name}
    </li>
  );
};