const getAppointmentsForDay = (state, day) => {

  //Get the day object for the name passed in day
  const targetDay = state.days.find(d => d.name === day);
  
  if (targetDay) {
    //Retrieve an array of appointmentIds from the day object
    const appointmentIds = targetDay.appointments;

    //Transform state.appointments object into array
    const allAppointmentsArray = Object.values(state.appointments);

    //Get the appointments whose ID is in appointmentIds
    const appointments = allAppointmentsArray.filter(appointment => appointmentIds.includes(appointment.id));

    return appointments;
  }

  //Day data does not exist: return empty array
  return [];
};

const getInterviewersForDay = (state, day) => {
  //Get the day object for the name passed in day
  const targetDay = state.days.find(d => d.name === day);
  
  if (targetDay) {
    //Get an array with interviewer ids for the day
    const interviewerIds = [ ...targetDay.interviewers ];

    //Get an array of all interviewers
    const allInterviewersArray = Object.values(state.interviewers);

    //Filter the interviewers array to only include the interviewers for the day
    const interviewers = allInterviewersArray.filter((interviewer) => interviewerIds.includes(interviewer.id));

    return interviewers;
  }

  return [];  
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
