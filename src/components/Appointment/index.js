import React, { useEffect } from "react";
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
  const ERROR_VERIFY = "Insufficient data: please type a student name and select an interviewer.";

  const { mode, transition, back } = useVisualMode(props.interview ? SHOW : EMPTY);

  //When interview data changes, transition the component as needed
  useEffect(() => {
    if (props.interview && mode === EMPTY) {
     transition(SHOW);
    }
    if (props.interview === null && mode === SHOW) {
     transition(EMPTY);
    }
   }, [props.interview, transition, mode]);

  const save = (name, interviewer) => {
    if (name && interviewer) {
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
    } else {
      //Reject incomplete form data. (Unfortunately this also resets the form to previous state)
      transition(ERROR_VERIFY);
    }
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
      {
        /*
        The second condition in the section below (EMPTY mode) prevents a visual glitch 
        on a connected browser when deleting an interview.
        
        The glitch is prompted because the transition from SHOW to EMPTY triggered in the side effect
        only occurs AFTER the component renders with the new prop data (that is, with a null-value for the interview).        
        So, at the time it receives the new prop (no interview), the component is still in SHOW mode.
        
        For SHOW mode, the added condition "&& props.interview" ensures we don't get a reference error, but it also means that 
        at this point none of the rendering conditions apply and hence nothing gets rendered.
        As a result the container collapses briefly, until the component rerenders in EMPTY mode after the transition.

        One way to avoid the momentary collapse of the container is to render the EMPTY component even if we are in fact
        in SHOW mode but do not have interview data. This is the workaround I'm applying here

        A better way would arguably be to effect the transition to EMPTY mode BEFORE re-rendering in the first place,
        but that seems beyond the scope of the exercise...
        */
      }
      {(mode === EMPTY || (mode === SHOW && !props.interview)) && 
        <Empty onAdd={() => transition(CREATE)} />
      }
      {mode === SHOW && props.interview && (
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
      {[ERROR_SAVE, ERROR_DELETE, ERROR_VERIFY].includes(mode) &&
        <Error
          message={mode}
          onClose={back}
        />
      }
    </article>
  );
};

export default Appointment;