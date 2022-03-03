const getAppointmentsForDay = (state, day) => {
  //Get the day object for the name passed in day
  const targetDay = state.days.find(d => {
    if (d.name === day) {
      return d.appointments;      
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

export {
  getAppointmentsForDay
};
