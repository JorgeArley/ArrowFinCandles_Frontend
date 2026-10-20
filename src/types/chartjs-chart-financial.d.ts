export {}

// El paquete declara los tipos del grafico financiero pero no exporta sus controladores:
// este archivo los expone para poder importarlos con TypeScript.
declare module 'chartjs-chart-financial' {
  import type { BarController, Chart, ChartComponent } from 'chart.js'

  export const CandlestickController: ChartComponent & {
    prototype: BarController
    new (chart: Chart, datasetIndex: number): BarController
  }

  export const CandlestickElement: Element
}
