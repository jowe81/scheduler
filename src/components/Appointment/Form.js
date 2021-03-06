import React, { useState } from "react";
import Button from "components/Button";
import InterviewerList from "components/InterviewerList";

export default function Form(props) {
  const [ student, setStudent ] = useState(props.student || "");
  const [ interviewer, setInterviewer ] = useState(props.interviewer || null);
  const [ error, setError ] = useState("");

  const reset = function() {
    setStudent("");
    setInterviewer(null);
  };

  const cancel = function() {
    reset();
    props.onCancel();
  }

  const save = function() {
    if (student === "") {
      setError("Student name cannot be blank");
    } else {
      setError("");
      props.onSave(student, interviewer);
    }
  }
  
  return (
    <main className="appointment__card appointment__card--create">
      <section className="appointment__card-left">
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <input
            className="appointment__create-input text--semi-bold"
            name="name"
            type="text"
            placeholder="Enter Student Name"
            data-testid="student-name-input"
            /*
              This must be a controlled component
              your code goes here
            */
            value={student}
            onChange={(e) => setStudent(e.target.value)}            
          />
        </form>
        <section className="appointment__validation">{error}</section>        
        <InterviewerList 
          /* your code goes here */
          interviewers={props.interviewers}
          value={interviewer}
          onChange={setInterviewer}
        />
      </section>
      <section className="appointment__card-right">
        <section className="appointment__actions">
          <Button danger onClick={cancel}>Cancel</Button>
          <Button confirm onClick={save}>Save</Button>
        </section>
      </section>
    </main>
  );
}
