
const actions = {
  SET_DAY: "SET_DAY",
  SET_APPLICATION_DATA: "SET_APPLICATION_DATA",
  SET_INTERVIEW: "SET_INTERVIEW",
  SET_SOCKET_CONN_STATUS: "SET_SOCKET_CONN_STATUS",
}

const reducer = (state, action) => {


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

    //Get the day object that the appointment belongs to    
    const targetDay = updatedDays.find(d => d.appointments.includes(appointmentId));

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
  const synchronizeAppointment = (id, interview) => {
    const updatedDays = updateDays(id, interview, state);
    const updatedAppointments = updateAppointments(id, interview, state);
    const updatedState = {
      ...state,
      appointments: updatedAppointments,
      days: updatedDays,
    }
    return updatedState;
  };



  switch (action.type) {
    case actions.SET_DAY:
      //action.value (day) should just be a string
      return {
        ...state,
        day:action.value.day
      };
    case actions.SET_APPLICATION_DATA:
      //this essentially reiniitializes the app (except for setting the selected day)
      return {
        ...state,
        days: action.value.days,
        appointments: action.value.appointments,
        interviewers: action.value.interviewers,
      };
    case actions.SET_INTERVIEW:
      //synchronizeAppointment returns cloned and fully updated state
      return synchronizeAppointment(action.appointmentId, action.value);
    case actions.SET_SOCKET_CONN_STATUS:
      //set a flag for socket connection status
      return {
        ...state,
        socketConnection: action.value.socketConnection,
      }
    default:
      throw new Error("Reducer called with unknown action type");
  }

}

export { reducer, actions };