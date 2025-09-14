declare module 'tlbs-map-vue' {
  import { Plugin } from 'vue'

  interface TlbsMap {
    map: any
  }

  interface TlbsMarker {
    marker: any
  }

  const TlbsMapVue: Plugin
  export default TlbsMapVue
}
