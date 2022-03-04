import { useState, useEffect } from "react";
import axios from "axios";

export default function useApplicationData() {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {}
  });

  /**
   * Changes the day string in the state so the view can show the given day
   * @param {String} day the day to be shown (e.g. "Monday")
   */
  const setDay = (day) => setState(prev => {
    return {...prev, day};
  });

  /**
   * Updates the number of available spots for a given day
   * @param {String} day the name of the day (e.g. "Monday")
   * @param {Integer} increment the # of spots to be added or subtracted
   */
  const adjustSpots = (day, increment) => setState(prev => {

    //Clone the prev.days array to updatedDays
    const updatedDays = prev.days.map(day => {
      return {
        ...day,
        appointments: [ ...day.appointments ],
        interviewers: [ ...day.interviewers ],
      };
    });

    //Get the day object for the name passed in day
    const targetDay = updatedDays.find(d => d.name === day);

    //Modify spots property directly (as targetDay is already a clone)
    targetDay.spots += increment;

    return {...prev, days: updatedDays};

  });

  /**
   * Makes an API call to book an interviewer
   * @param {Integer} id the id of the appointment to book the interview for
   * @param {Object} interview the new interview object (with student name and interviewer id)
   * @returns a promise to the completed API call
   */
   const bookInterview = (id, interview) => {
    return new Promise ((resolve, reject) => {      

      //Determine whether we're updating or creating the interview (to keep track of open spots)
      const interviewExisted = state.appointments[id].interview !== null;

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
            if (!interviewExisted) {
              //Subtract a spot since this interview didn't exist before
              adjustSpots(state.day, -1);
            }
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
            adjustSpots(state.day, 1);
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

