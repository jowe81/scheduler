import React from "react";
import "components/InterviewerList.scss";
import InterviewerListItem from "components/InterviewerListItem";

export default function InterviewerList(props) {
  const listItems = props.interviewers.map(item => {
    const data = {
      key: item.id,
      name: item.name,
      avatar: item.avatar,
      selected: props.value === item.id,
      setInterviewer: () => { props.onChange(item.id) },
    }
    return <InterviewerListItem {...data}></InterviewerListItem>;
  });

  return (
    <section className="interviewers">
      <h4 className="interviewers__header text--light">Interviewer</h4>
      <ul className="interviewers__list">{listItems}</ul>
    </section>    
  );
}