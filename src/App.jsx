import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import './App.css'; // Import your CSS file here

function App() {
  return (
    <MeetingProvider
      config={{
        meetingId: "bmnl-shsf-8s1k",
        micEnabled: true,
        webcamEnabled: true,
        name: "Umer's Org",
      }}
      token="your_token_here" // Ensure to replace with a valid token
    >
      <MeetingView />
    </MeetingProvider>
  );
}

function MeetingView() {
  const [joined, setJoined] = useState(null);
  const { join, participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
  });

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  return (
    <div className="meeting-container">
      {joined === "JOINED" ? (
        <div className="participants-container">
          {[...participants.keys()].map((participantId) => (
            <ParticipantView participantId={participantId} key={participantId} />
          ))}
        </div>
      ) : joined === "JOINING" ? (
        <p className="status-message">Joining the meeting...</p>
      ) : (
        <button className="join-button" onClick={joinMeeting}>
          Join the Meeting
        </button>
      )}
    </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal } = useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((error) => console.error("audioElem.current.play() failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className="participant-view">
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn && (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          height={"300px"}
          width={"300px"}
          onError={(err) => console.log(err, "participant video error")}
        />
      )}
    </div>
  );
}

export default App;
