import React, { useState, useEffect } from "react";
import axios from "axios";
import "components/Application.scss";
import DayList from "components/DayList";
import Appointment from "components/Appointment";
import { getAppointmentsForDay, getInterviewersForDay, getInterview } from "helpers/selectors";

export default function Application(props) {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {}
  });

  const setDay = (day) => setState({...state, day});

  const dailyAppointments = getAppointmentsForDay(state, state.day);
  const interviewers = getInterviewersForDay(state, state.day);

  useEffect(() => {

    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ]).then(all => {
      const days = all[0].data;
      const appointments = all[1].data;
      const interviewers = all[2].data;
      setState(prev => ({ ...prev, days, appointments, interviewers }));
    });

  }, []);

  /**
   * Makes an API call to book an interviewer
   * @param {Integer} id the id of the appointment to book the interview for
   * @param {Object} interview the new interview object (with student name and interviewer id)
   * @returns a promise to the completed API call
   */
  const bookInterview = (id, interview) => {
    return new Promise ((resolve, reject) => {      

      const appointment = {
        ...state.appointments[id],
        interview: { ...interview }
      };
  
      const appointments = {
        ...state.appointments,
        [id]: appointment
      }
  
      const updatedState = {
        ...state,
        appointments
      }
  
      axios
        .put(`/api/appointments/${id}`, { interview })
        .then(response => {
          if (response.status === 204) {
            setState(updatedState);
            resolve();  
          } else { 
            reject(new Error(`Invalid response received from API. Expected 204 and received ${response.status}.`));
          }
        })
        .catch(reject);
    });
  }

  /**
   * Makes an API call do cancel an interview for a given appointment slot
   * @param {Integer} id the ide of the appointment slot to cancel the interview for
   * @returns a promise to the completed API call
   */
  const cancelInterview = id => {
    return new Promise((resolve, reject) => {

      const updatedAppointment = {
        ...state.appointments[id],
        interview: null,
      }
  
      const updatedAppointments = {
        ...state.appointments,
        [id]: updatedAppointment,
      }
  
      const updatedState = {
        ...state,
        appointments: { ...updatedAppointments },
      }
  
      axios
        .delete(`/api/appointments/${id}`)
        .then(response => {
          if (response.status === 204) {
            setState(updatedState);
            resolve();  
          } else {
            reject(new Error(`Invalid response received from API. Expected 204 and received ${response.status}.`));
          }
        })
        .catch(reject);
  
    });
  };
  
  const schedule = dailyAppointments.map(appointment => {
    const interview = getInterview(state, appointment.interview);

    return (
      <Appointment 
        key={appointment.id} 
        id={appointment.id}
        time={appointment.time}
        interview={interview}
        interviewers={interviewers}
        bookInterview={bookInterview}
        cancelInterview={cancelInterview}
      />
    );
  })

  return (
    <main className="layout">
      <section className="sidebar">
        {/* Replace this with the sidebar elements during the "Project Setup & Familiarity" activity. */}
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList
            days={state.days}
            value={state.day}
            onChange={setDay}
          />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {schedule}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}
