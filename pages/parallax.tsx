import { ParallaxProvider } from "react-scroll-parallax";
import { AdvancedBannerTop } from "../components/AdvancedBanner";

export default function Test() {

    return (
        
        <ParallaxProvider>
            <AdvancedBannerTop />
            <div className="" style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}>
                <h1 className="headline gray">Goodnight.</h1>
            </div>
        </ParallaxProvider>
        
    )

};

