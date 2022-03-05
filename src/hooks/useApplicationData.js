import { useState, useEffect } from "react";
import axios from "axios";

export default function useApplicationData() {

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {}
  });

  /**
   * Clone the days data and update spot count according to passed interview data
   * @param {integer} appointmentId 
   * @param {object | null} interview Interview object or null
   * @param {object} prev Previous state 
   * @returns a clone of prev.days, with updated spot count for day
   */
  const updateDays = (appointmentId, interview, prev) => {

    //Clone the prev.days array to updatedDays
    const updatedDays = prev.days.map(day => {
      return {
        ...day,
        appointments: [ ...day.appointments ],
        interviewers: [ ...day.interviewers ],
      };
    });

    //Determine whether and how spot count needs to change
    let increment = 0;
    const interviewExisted = prev.appointments[appointmentId].interview !== null;
    if (interview !== null && !interviewExisted) {
      //Book and interview in a previously empty spot: subtract a spot
      increment = -1;
    } else if (interviewExisted && interview === null) {
      //Delete an interview from a previously filled spot: add a spot
      increment = +1;
    }

    //Get the day object
    const targetDay = updatedDays.find(d => d.name === prev.day);

    //Apply new spot count directly (as targetDay is already a clone)
    targetDay.spots += increment;
    
    return updatedDays;
  }

  /**
   * Clone and update prev.appointments according to passed interview data
   * @param {integer} appointmentId 
   * @param {*} interview 
   * @param {*} prev 
   * @returns 
   */
  const updateAppointments = (appointmentId, interview, prev) => {
    
    const updatedAppointment = {
      ...prev.appointments[appointmentId],
      interview,
    }

    const updatedAppointments = {
      ...prev.appointments,
      [appointmentId]: updatedAppointment,
    }

    return updatedAppointments;
  }

  /**
   * Update app state for booked, changed, or canceled appointment
   * @param {integer} id The appointment id 
   * @param {object | null} interview the new interview data (or null) for the appointment
   */
  const synchronizeAppointment = (id, interview) => setState(prev => {
    const updatedDays = updateDays(id, interview, prev);
    const updatedAppointments = updateAppointments(id, interview, prev);
    const updatedState = {
      ...prev,
      appointments: updatedAppointments,
      days: updatedDays,
    }
    return updatedState;
  });

  /**
   * Changes the day string in the state so the view can show the given day
   * @param {String} day the day to be shown (e.g. "Monday")
   */
  const setDay = (day) => setState(prev => {
    return {...prev, day};
  });
  
  /**
   * Makes an API call to book an interviewer
   * @param {Integer} id the id of the appointment to book the interview for
   * @param {Object} interview the new interview object (with student name and interviewer id)
   * @returns a promise to the completed API call
   */
   const bookInterview = (id, interview) => {
    return new Promise ((resolve, reject) => {        
      axios
        .put(`/api/appointments/${id}`, { interview })
        .then(response => {
          if (response.status === 204) {
            synchronizeAppointment(id, interview);
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
      axios
        .delete(`/api/appointments/${id}`)
        .then(response => {
          if (response.status === 204) {
            synchronizeAppointment(id, null);
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

