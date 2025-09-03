import React from "react";
import ReactApexChart from "react-apexcharts";

class RadialBarChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
        chart: {
          height: 350,
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: {
              size: "70%",
            },
            dataLabels: {
              name: {
                offsetY: -10,
                color: "#888",
                fontSize: "16px",
              },
              value: {
                color: "#111",
                fontSize: "36px",
                show: true,
              },
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "horizontal",
            gradientToColors: ["#ABE5A1"],
            stops: [0, 100],
          },
        },
        stroke: {
          lineCap: "round",
        },
        labels: ["Progress"], // Label displayed in the center
      },
    };
  }

  render() {
    return (
      <div id="radial-bar-chart">
        {/* Pass the series dynamically via props */}
        <ReactApexChart
          options={this.state.options}
          series={[this.props.percentage]} // Accept the percentage as a prop
          type="radialBar"
          height={350}
        />
      </div>
    );
  }
}

export default RadialBarChart;
