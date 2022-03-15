import { useReducer, useEffect } from "react";
import axios from "axios";
import { reducer, actions } from "../reducer";

export default function useApplicationData() {

  const initialState = {    
    day: "Monday",
    days: [],
    appointments: {},
    socketConnection: false,
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  
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
            //Only update state here if we don't have a socket connection triggering a state update (maybe this is unnecessary)
            if (!state.socketConnection) {
              dispatch({
                type: actions.SET_INTERVIEW,
                appointmentId: id,
                value: interview,
              });
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
      axios
        .delete(`/api/appointments/${id}`)
        .then(response => {
          if (response.status === 204) {
            //Only update state here if we don't have a socket connection triggering a state update (maybe this is unnecessary)
            if (!state.socketConnection) {
              dispatch({
                type: actions.SET_INTERVIEW,
                appointmentId: id,
                value: null,
              });
            }
            resolve();  
          } else {
            reject(new Error(`Invalid response received from API. Expected 204 and received ${response.status}.`));
          }
        })
        .catch(reject);  
    });
  };

  const setDay = day => {
    dispatch({
      type: actions.SET_DAY,
      value: { day },
    })
  }

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
      dispatch({
        type: actions.SET_APPLICATION_DATA,
        value: { days, appointments, interviewers},
      });
    });
  }, []);

  //Connect to socket server
  useEffect(() => {    
    const socketURL = process.env.REACT_APP_WEBSOCKET_URL;
    if (!socketURL) {
      dispatch({
        type: actions.SET_SOCKET_CONN_STATUS,
        value: { socketConnection: false },
      });      
    } else {
      const socket = new WebSocket(socketURL);
      socket.onopen = event => {
        dispatch({
          type: actions.SET_SOCKET_CONN_STATUS,
          value: { socketConnection: true },
        });
      }
      socket.onclose = event => {
        dispatch({
          type: actions.SET_SOCKET_CONN_STATUS,
          value: { socketConnection: false },
        });
      }
      socket.onerror = event => {
        console.log(`Error: Socket connection to ${socketURL} failed`, event);
      }
      socket.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.type === "SET_INTERVIEW") {
          //Received interview data - update state
          dispatch({
            type: actions.SET_INTERVIEW,
            appointmentId: msg.id,
            value: msg.interview,
          });
        }
      }      
    }
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  }

}

