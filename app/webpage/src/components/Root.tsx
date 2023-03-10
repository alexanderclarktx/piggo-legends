import '@pixi/unsafe-eval';
import React, { useEffect, useState } from 'react';
import { GameClient, NetManager } from '@piggo-legends/gamertc';
import { NetConnector, NetState } from './NetConnector';
import { Header } from './Header';
import { GameCanvas } from './GameCanvas';

// webpage root component. all non-local state should be initialized here
export const Root = () => {
  const [netManager, setNetManager] = useState<NetManager | undefined>();
  const [gameClient, setGameClient] = useState<GameClient | undefined>();
  const [sdp, setSdp] = useState({ local: "", remote: "" });
  const [theirMediaStream, setTheirMediaStream] = useState<MediaStream | undefined>();
  const [netState, setNetState] = useState<NetState>("none");
  const [modalOpen, setModalOpen] = useState(false);

  // expose the game client to the console
  useEffect(() => {
    window["client"] = gameClient;
  }, [sdp.local, sdp.remote]);

  // initialize the net manager
  const onLocalUpdated = (local: string) => setSdp({ local: btoa(local), remote: sdp.remote });
  const onMedia = (stream: MediaStream) => setTheirMediaStream(stream);
  const onConnected = () => setNetState("connected");
  useEffect(() => {
    setNetManager(new NetManager(onLocalUpdated, onMedia, onConnected));
  }, []);

  return (
    <div>
      <Header />
      <NetConnector
        netManager={gameClient?.net}
        sdp={sdp}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        netState={netState}
        setNetState={setNetState}
        theirMediaStream={theirMediaStream}
      />
      <GameCanvas
        netManager={netManager}
        setGameClient={setGameClient}
      />
    </div>
  );
}
