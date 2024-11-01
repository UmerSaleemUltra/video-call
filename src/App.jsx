import React, { useEffect, useMemo, useRef, useState } from "react";
import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import { 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, 
  FaUserCircle, FaUserFriends, FaVolumeUp, FaVolumeMute, FaImage
} from "react-icons/fa";

const primaryColor = "#4F46E5";
const dangerColor = "#EF4444";
const successColor = "#10B981";

export default function Component() {
  const [userName, setUserName] = useState("User");
  const [meetingId, setMeetingId] = useState("bmnl-shsf-8s1k");
  const [audioOnly, setAudioOnly] = useState(false);

  return (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: !audioOnly,
        name: userName,
      }}
      token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJlNDAwYjQyOS05NzRmLTRmNWUtOWMwNi02ZmNhODUwN2E5N2UiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczMDQwNTE3MywiZXhwIjoxNzMwNDkxNTczfQ.fLQ3-UYllx9ZmFtELwHBjuhD057gHSzj1bXVjmGf9Us"
    >
      <MeetingView 
        setUserName={setUserName} 
        meetingId={meetingId} 
        setMeetingId={setMeetingId} 
        audioOnly={audioOnly} 
        setAudioOnly={setAudioOnly} 
      />
    </MeetingProvider>
  );
}

function MeetingView({ setUserName, meetingId, setMeetingId, audioOnly, setAudioOnly }) {
  const [joined, setJoined] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);
  const { join, participants, leave } = useMeeting({
    onMeetingJoined: () => {
      setLoading(false);
      setJoined("JOINED");
    },
  });

  const joinMeeting = () => {
    setLoading(true);
    join();
  };

  const handleLeaveMeeting = () => {
    leave();
    setJoined(null);
  };

  const toggleParticipantList = () => {
    setShowParticipantList(!showParticipantList);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4 md:p-8">
      {joined !== "JOINED" ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl transition-all duration-300 ease-in-out ">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">Join Meeting</h2>
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="text"
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={meetingId}
              placeholder="Enter Meeting ID"
              onChange={(e) => setMeetingId(e.target.value)}
            />
            <label className="flex items-center mb-6">
              <input
                type="checkbox"
                checked={audioOnly}
                onChange={(e) => setAudioOnly(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">Audio Only Mode</span>
            </label>
            {loading ? (
              <p className="text-center text-indigo-600">Joining the meeting...</p>
            ) : (
              <button 
                onClick={joinMeeting}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Join the Meeting
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {[...participants.keys()].map((participantId) => (
              <ParticipantView 
                key={participantId} 
                participantId={participantId}
              />
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex justify-center items-center space-x-4 flex-wrap">
            <ControlButton onClick={toggleParticipantList} active={showParticipantList}>
              <FaUserFriends /> Participants
            </ControlButton>
            <ControlButton onClick={handleLeaveMeeting} color={dangerColor}>
              <FaPhoneSlash /> End Call
            </ControlButton>
          </div>
          {showParticipantList && (
            <div className="absolute right-4 top-4 bg-white rounded-xl shadow-md p-4 max-w-xs max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Participants</h3>
              {[...participants.keys()].map((participantId) => (
                <div key={participantId} className="flex items-center mb-2">
                  <FaUserCircle className="mr-2 text-gray-500" />
                  <span>{participants.get(participantId).displayName || `Participant ${participantId}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ParticipantView({ participantId }) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);
  const [isMuted, setIsMuted] = useState(!micOn);
  const [isVideoOff, setIsVideoOff] = useState(!webcamOn);
  const [volume, setVolume] = useState(1);
  const [virtualBackground, setVirtualBackground] = useState(null);

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Here you would typically call a function to actually mute/unmute the participant
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Here you would typically call a function to actually turn on/off the participant's video
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (micRef.current) {
      micRef.current.volume = newVolume;
    }
  };

  const changeVirtualBackground = () => {
    // In a real implementation, you would integrate with a virtual background library
    // For this example, we'll just cycle through a few preset background images
    const backgrounds = [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300&text=Beach",
      "/placeholder.svg?height=200&width=300&text=Office",
    ];
    setVirtualBackground((prev) => {
      const currentIndex = backgrounds.indexOf(prev);
      return backgrounds[(currentIndex + 1) % backgrounds.length];
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ">
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      <div className="relative">
        {webcamOn && !isVideoOff ? (
          <div className="relative">
            <ReactPlayer
              playsinline
              pip={false}
              light={false}
              controls={false}
              muted={true}
              playing={true}
              url={videoStream}
              height={"200px"}
              width={"100%"}
              onError={(err) => console.log(err, "participant video error")}
            />
           
          </div>
        ) : (
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <FaUserCircle size={64} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">{isLocal ? "You" : displayName || `Participant ${participantId}`}</span>
        </div>
        <div className="flex justify-around mb-2">
          <button 
            onClick={toggleMute}
            className={`p-2 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
          >
            {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-2 rounded-full ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
          >
            {isVideoOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
          </button>
          <button
            onClick={changeVirtualBackground}
            className="p-2 rounded-full bg-blue-100 text-blue-600"
          >
            <FaImage size={20} />
          </button>
        </div>
        {!isLocal && (
          <div className="flex items-center">
            {volume === 0 ? <FaVolumeMute className="text-gray-500 mr-2" /> : <FaVolumeUp className="text-gray-500 mr-2" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ControlButton({ children, onClick, active, color = primaryColor }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md font-medium transition-colors duration-300
        ${active ? `bg-${color} text-white` : `bg-white text-${color} border border-${color}`}
        hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-${color} focus:ring-opacity-50
      `}
    >
      {children}
    </button>
  );
}