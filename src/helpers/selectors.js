const getAppointmentsForDay = (state, day) => {

  //Get the day object for the name passed in day
  const targetDay = state.days.find(d => {
    if (d.name === day) {
      return [ ...d.appointments ]; //really important to make a new array here!
    }
  });
  
  if (targetDay) {
    //Retrieve an array of appointmentIds from the day object
    const appointmentIds = targetDay.appointments;

    //Transform state.appointments object into array
    const allAppointmentsArray = Object.values(state.appointments);

    //Get the appointments whose ID is in appointmentIds
    const appointments = allAppointmentsArray.filter(appointment => {
      return appointmentIds.includes(appointment.id);
    });

    return appointments;
  }

  //Day data does not exist: return empty array
  return [];
};

const getInterviewersForDay = (state, day) => {
  const appointments = getAppointmentsForDay(state, day);

  //Get only those appointments that have bookings
  const appointmentsWithBookings = appointments.filter(appointment => appointment.interview);

  //Get the interviewer data for the interviewer Ids stored in the booked appointments
  const interviewers = appointmentsWithBookings.map(appointment => state.interviewers[appointment.interview.interviewer]);
  
  return interviewers;  
};

const getInterview = (state, interview) => {

  //Get Id of interviewer we're looking for, if one is booked
  const interviewerId = interview && interview.interviewer;

  if (interviewerId) {
    const interviewerData = state.interviewers[interviewerId];
    const fullInterviewData = {
      ...interview,
      interviewer: { ...interviewerData}
    }
    return fullInterviewData;
  }
  return null;
}

export {
  getAppointmentsForDay,
  getInterview,
  getInterviewersForDay
};
