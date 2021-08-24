import Destination, {Envelope, GainNode, OscillatorNode} from './AudioNodes';

export default function createGraph(context) {
  return{
    out: Destination(context),
    main: GainNode(context, "out"),
    carriervol: GainNode(context, "main"),
    carrier: OscillatorNode(context, "carriervol", {
      freqcontrols:true
      // surface: { x: "frequency", y: "detune" }
    }),
    index: GainNode(context, {node:"carrier", param:"frequency"}, {min:0, max:2000}),
    modulator: OscillatorNode(context, "index", {freqcontrols:true, typedefault:"sawtooth", freqmin:10, freqmax:100, typecontrols:true}),
    pulse: Envelope(context, {node:"carriervol", param:"gain"}),
  }
}