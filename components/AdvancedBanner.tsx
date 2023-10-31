import { ParallaxBanner } from "react-scroll-parallax";
import { BannerLayer } from "react-scroll-parallax/dist/components/ParallaxBanner/types";

export const AdvancedBannerTop = () => {

    const moment = require('moment');
    var date = moment.utc().format();
    var checkTime = true;
    moment.updateLocale('en', {
    
        /*
        moment.updateLocale('en', {
 
            // Specify the callback function for
            // customizing the values
            meridiem: function (hour, minute, isLowercase) {
                if (hour >= 12)
                    return isLowercase ? 'p.m.' : 'P.M.';
                else
                    return isLowercase ? 'a.m.' : 'A.M.';
            }
        });
        */
        // Specify the callback function for
        // customizing the values
        meridiem: function (hour: any, minute: any, isLowercase: any) {

            if (hour > 12)
                return isLowercase ? 'p.m.' : 'PM';
            else
                return isLowercase ? 'a.m.' : 'AM';
        }
    });
    
   // console.log(moment().format('HH:mm A'));

    if (moment().format('A') == "AM") {
        checkTime = true;
    } else {
        checkTime = false;
    }

    const background: BannerLayer = {
        image: checkTime? "/ATG_Market_Light3.png" : "/ATG_Market_Dark3.png",
        translateY: [15, 15],
        opacity: [1, 0.01],
        scale: [1.05, 1.3, "easeOutCubic"],
        shouldAlwaysCompleteAnimation: true,
        expanded: true,
        
    }


  const headline: BannerLayer = {
    translateY: [0, 30],
    scale: [1, 1.1, "easeOutCubic"],
    shouldAlwaysCompleteAnimation: true,
    expanded: false,
    children: (
        <>
        </>
    )
  };

  const foreground: BannerLayer = {
    image:
      "/fog2.png",
    translateY: [0, 15],
    scale: [1, 1.1, "easeOutCubic"],
    shouldAlwaysCompleteAnimation: true
  };

  const foreground2: BannerLayer = {
    image:
      "/fog.png",
    translateY: [0, 15],
    scale: [1, 1.1, "easeOutCubic"],
    shouldAlwaysCompleteAnimation: true
  };

  const gradientOverlay: BannerLayer = {
    opacity: [0, 1, "easeOutCubic"],
    shouldAlwaysCompleteAnimation: true,
    expanded: false,
    children: <div className="gradient inset" />
  };

  return (
    <ParallaxBanner
      layers={[background, headline, foreground2, gradientOverlay]}
      className="full" style={{height:'100vh', marginTop: '8vh'}}
    />
  );
};
