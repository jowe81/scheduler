import React from "react";
import "./styles.scss";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import useVisualMode from "hooks/useVisualMode";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";


const Appointment = (props) => {

  const EMPTY = "EMPTY";
  const SHOW = "SHOW";
  const CREATE = "CREATE";
  const SAVING = "Booking interview";
  const CANCELING = "Canceling interview";
  const CONFIRM = "CONFIRM";
  const EDIT = "EDIT";
  const ERROR_SAVE = "An error occurred while trying to save the appointment data.";
  const ERROR_DELETE = "An error occurred while trying to cancel the appointment.";

  const { mode, transition, back } = useVisualMode(props.interview ? SHOW : EMPTY);

  const save = (name, interviewer) => {
    transition(SAVING);
    const interview = {
      student: name,
      interviewer
    };
    props.bookInterview(props.id, interview)
      .then(() => transition(SHOW))
      .catch(err => {
        transition(ERROR_SAVE, true);
        console.log(`API call failed on save: ${err}`);
      });
  }

  const confirmCancellation = () => {
    transition(CONFIRM);
  }

  const cancelInterview = () => {
    transition(CANCELING, true);
    props.cancelInterview(props.id)
      .then(() => transition(EMPTY))
      .catch(err => {
        transition(ERROR_DELETE, true);
        console.log(`API call failed on delete: ${err}`);
      });
  }

  const enterEditMode = () => transition(EDIT);

  return (
    <article className="appointment">
      <Header time={props.time}/>
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={confirmCancellation}  
          onEdit={enterEditMode}        
        />
      )}
      {mode === CREATE && 
        <Form 
          interviewers = {props.interviewers}
          onCancel = {back}
          onSave = {save}
        />
      }
      {(mode === SAVING || mode === CANCELING) &&
        <Status
          message = { mode }
        />
      }
      {mode === CONFIRM &&
        <Confirm
          message = {"Do you really want to cancel this interview?"}
          onConfirm={cancelInterview}
          onCancel={back}
        />
      }
      {mode === EDIT &&
        <Form
          interviewers={props.interviewers}
          student={props.interview.student}
          interviewer={props.interview.interviewer.id}
          onCancel={back}
          onSave={save}
        />
      }
      {(mode === ERROR_SAVE || mode === ERROR_DELETE) &&
        <Error
          message={mode}
          onClose={back}
        />
      }
    </article>
  );
};

export default Appointment;