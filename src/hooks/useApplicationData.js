import { useState, useEffect } from "react";
import axios from "axios";

export default function useApplicationData() {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {}
  });

  /**
   * Changes the state data so the view can show the given day
   * @param {String} day the day to be shown (e.g. "Monday")
   */
  const setDay = (day) => setState({...state, day});

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

  // Retrieve initial app data from API 
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


  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  }

}

