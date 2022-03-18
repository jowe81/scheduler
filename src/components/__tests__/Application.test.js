import React from "react";

import { 
  render, 
  cleanup, 
  waitForElement, 
  fireEvent, 
  prettyDOM, 
  getByText, 
  getAllByTestId, 
  queryByText, 
  getByAltText,
  queryByAltText,
  getByLabelText, 
  getByPlaceholderText, 
  findByText,
  findAllByTestId,
  getByDisplayValue
} from "@testing-library/react";

import Application from "components/Application";

import axios from "axios";

afterEach(cleanup);

describe("Application", () => {

  //async await version doesn't need to return promise (async keyword takes care of that?)
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);
    await waitForElement(() => getByText("Monday")); //tries finding the element for several seconds
    fireEvent.click(getByText("Tuesday"));
    expect(getByText("Leopold Silvers")).toBeInTheDocument();
  });


  //Promise version of same test [must return promise]
  /*
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { getByText } = render(<Application />);
    return waitForElement(() => getByText("Monday")).then(() => {
      fireEvent.click(getByText("Tuesday"));
      expect(getByText("Leopold Silvers")).toBeInTheDocument();
    });  
  });
  */

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async() => {
    const { container } = render(<Application />);
    //Wait until appointments render
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Grab all appointments
    const appointments = getAllByTestId(container, "appointment");
    //Grab the first one to use in the test
    const appointment = appointments[0];
    //Click add button
    fireEvent.click(getByAltText(appointment, "Add"));
    //Type student name
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), { target: { value: "Lydia Miller-Jones" }});
    //Click interviewer
    fireEvent.click(getByAltText(appointment, "Tori Malcolm"));
    //Click save button
    fireEvent.click(getByText(appointment, "Save"));
    //Check that the status text shows
    expect(getByText(appointment, /booking interview/i)).toBeInTheDocument();
    //Wait for the booking to complete and the response to show
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));
    //Confirm that the component is in "show" mode, displaying the Delete/Edit buttons.
    expect(getByAltText(appointment, "Delete")).toBeInTheDocument();
    expect(getByAltText(appointment, "Edit")).toBeInTheDocument();
    //Confirm that the number of spots remaining gets updated
    const days = getAllByTestId(container, "day");
    const monday = days.find(day => queryByText(day, "Monday"));
    expect(getByText(monday, /no spots remaining/i)).toBeInTheDocument();
  });


  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    //Render the Application.
    const { container } = render(<Application />);
    //Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));    
    //Grab Archie Cohen appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(appointment => queryByText(appointment, "Archie Cohen"));    
    //Click the "Delete" button on Archie Cohen's appointment
    fireEvent.click(getByAltText(appointment, /delete/i));
    //Click the confirm button on the confirmation dialog
    fireEvent.click(getByText(appointment, /confirm/i));
    //Wait for operation to complete and confirm that the appointment is now empty (add button is back)
    await waitForElement(() => getByAltText(appointment, /add/i));
    //Grab daylist item for Monday 
    const days = getAllByTestId(container, "day");
    const monday = days.find(day => getByText(day, "Monday"));
    //Check that the DayListItem with the text "Monday" has "2 spot remaining".
    expect(getByText(monday, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    //Render the Application.
    const { container } = render(<Application />);
    //Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));    
    //Grab Archie Cohen appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(appointment => queryByText(appointment, "Archie Cohen"));    
    //Click the "Edit" button on Archie Cohen's appointment
    fireEvent.click(getByAltText(appointment, /edit/i));
    //Change the name
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), { 
      target: {value: "Jessica Lee Bjorkman"}
    });
    //Click the save button
    fireEvent.click(getByText(appointment, /save/i));
    //Wait for operation to complete and confirm that the appointment now has the new student
    await waitForElement(() => getByText(appointment, /jessica lee bjorkman/i));
    //Grab daylist item for Monday 
    const days = getAllByTestId(container, "day");
    const monday = days.find(day => getByText(day, "Monday"));
    //Check that the DayListItem with the text "Monday" has "1 spot remaining".
    expect(getByText(monday, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the save error when failing to save an appointment", async() => {
    //Render the application
    const { container } = render(<Application />);
    //Wait for data to load
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Grab an empty appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(appointment => queryByAltText(appointment, /add/i));
    //Click add button
    const addButton = getByAltText(appointment, /add/i);
    fireEvent.click(addButton);
    //Type name
    const input = getByPlaceholderText(appointment, /enter student name/i);
    fireEvent.change(input, {
      target: { value: "Mark Smith"}
    });
    //Get and select an interviewer
    const interviewers = getAllByTestId(container, "interviewer");
    const interviewer = interviewers[0];
    fireEvent.click(interviewer);
    //Attempt save
    axios.put.mockRejectedValueOnce(new Error("Could not store interview record"));
    fireEvent.click(getByText(appointment, /save/i));
    //Wait for error dialogue
    await findByText(appointment, /error occurred/i);
    //Click close on the error
    fireEvent.click(getByAltText(appointment, /close/i));
    //Confirm that edit form is back, with the previously entered name retained
    expect(getByDisplayValue(appointment, "Mark Smith")).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an appointment", async() => {
    //Render the application
    const { container } = render(<Application />);
    //Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));    
    //Grab Archie Cohen appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments.find(appointment => queryByText(appointment, "Archie Cohen"));        
    //Grab and click delete button
    const deleteButton = getByAltText(appointment, /delete/i);
    fireEvent.click(deleteButton);
    //Click confirm on error dialogue
    axios.delete.mockRejectedValueOnce(new Error("Could not remove interview record"));
    fireEvent.click(getByText(appointment, /confirm/i));
    //Wait for error dialogue
    await findByText(appointment, /error occurred/i);
    //Click close on the error
    fireEvent.click(getByAltText(appointment, /close/i));
    //Confirm that appointment is back (show mode)
    expect(getByText(appointment, "Archie Cohen")).toBeInTheDocument();
  });
});
