import { Line } from "react-chartjs-2";
import List from "./List";
import classes from "./Chart.module.css";
export default function Chart({ loadData, season, startWeek, expansionName }) {
  // finds the current season
  const filterSeason = loadData.filter((item) => {
    return item.season === season;
  });

  // finds the current cycle
  const minCycle = (week) =>
    filterSeason.filter((item) => {
      return item.week <= week;
    });
  const maxCycle = (week) =>
    filterSeason.filter((item) => {
      return item.week >= week;
    });
  // finds the current week and affix
  const filterAffix = (currentWeek, currentRotation) =>
    filterSeason
      .filter((item) => {
        return item.week === currentWeek;
      })
      .map((item) => {
        return item.rotation[currentRotation];
      });

  // calculates the weekly total # of players
  const scheduleCalculate = () => {
    let arr = [];
    if (minCycle(12)) {
      for (let j = 1; j <= 12; j++) {
        arr.push(parseInt(filterAffix(j, j)));
      }
    }
    if (maxCycle(12) && minCycle(24)) {
      for (let k = 13; k <= 24; k++) {
        arr.push(filterAffix(k, k - 12) - filterAffix(k - 12, k - 12));
      }
    }
    if (maxCycle(24) && minCycle(36)) {
      for (let l = 25; l <= 36; l++) {
        arr.push(
          filterAffix(l, l - 24) -
            filterAffix(l - 12, l - 12) -
            filterAffix(l - 24, l - 24)
        );
      }
    }
    if (maxCycle(36) && minCycle(48)) {
      for (let m = 37; m <= 48; m++) {
        arr.push(
          filterAffix(m, m - 36) -
            filterAffix(m - 12, m - 12) -
            filterAffix(m - 24, m - 24) -
            filterAffix(m - 36, m - 36)
        );
      }
    }
    return arr;
  };
  // removes all NaN, and negative numbers in array
  const formatSchedule = () => {
    let arr = [];
    const schedule = scheduleCalculate();
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i] > 0) {
        arr.push(schedule[i]);
      }
    }
    return arr;
  };
  // conditionally renders more graph area
  const labelLength = () => {
    let arr = [];
    for (let i = 0; i < formatSchedule().length; i++) {
      arr.push(`Week ${startWeek + i}`);
    }
    return arr;
  };
  // repeats affix for each cycle depending on the schedule length
  const putAffixInArray = () => {
    const affixObject = filterSeason[0].affixes;
    let arr = [];
    for (let i = 0; i < scheduleCalculate().length; i++)
      for (let j = 0; j < affixObject.length; j++) {
        arr.push(affixObject[j]);
      }
    return arr;
  };

  const renderAffixList = () => {
    let arr = [];
    for (let i = 0; i < formatSchedule().length; i++) {
      arr.push(`${startWeek + i}-${putAffixInArray()[startWeek + i - 1]}`);
    }
    return arr;
  };

  const data = {
    labels: labelLength(),
    datasets: [
      {
        data: formatSchedule(),
        fill: true,
        borderColor: "deeppink",
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "hidden",
      },
      title: {
        display: true,
        text: `${expansionName} Mythic+ Season ${season} Player Count`,
        tooltip: {
          enabled: false,
          position: "nearest",
          // external: externalTooltipHandler,
        },
      },
    },
  };
  const legend = {};

  return (
    <div className={classes.body}>
      <div className={classes.chart}>
        <Line options={options} data={data} />
      </div>

      <div className={classes.list}>
        <List renderAffixList={() => renderAffixList()} />
      </div>
    </div>
  );
}
