import React from "react";
import PropTypes from "prop-types";

import "components/InterviewerList.scss";
import InterviewerListItem from "components/InterviewerListItem";

function InterviewerList(props) {
  const listItems = props.interviewers.map(interviewer => {
    const data = {
      key: interviewer.id,
      name: interviewer.name,
      avatar: interviewer.avatar,
      selected: props.value === interviewer.id,
      setInterviewer: () => { props.onChange(interviewer.id) },
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

InterviewerList.propTypes = {
  interviewers: PropTypes.array.isRequired
};

export default InterviewerList;