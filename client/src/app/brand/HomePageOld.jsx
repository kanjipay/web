import "./HomePageOld.css";
import useWindowSize from "../../utils/helpers/useWindowSize";
import Spacer from "../../components/Spacer";
import { useEffect, useState } from "react";
import MainButton from "../../components/MainButton";
import { Colors } from "../../enums/Colors";
import { Link } from "react-router-dom";
import { transactionFee } from "../../utils/variables";

function Benefit({ title, body }) {
  return <div style={{ textAlign: "center" }}>
    <h3 className="Home__headingSmall">{title}</h3>
    <Spacer y={3} />
    <p>{body}</p>
  </div>
}

function Accordion({ title, body }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const caratRotationAngle = isExpanded ? 180 : 0

  return <div className="Home__accordion" onClick={() => setIsExpanded(!isExpanded)} >
    <div style={{ display: "flex", alignItems: "center" }}>
      <p style={{ fontSize: 20, fontWeight: 800 }}>{title}</p>
      <div className="flex-spacer"></div>
      <img 
        alt=""
        src="/img/carat.png" 
        style={{ 
          width: 24, 
          height: 24, 
          objectFit: "contain",
          transform: `rotate(${caratRotationAngle}deg)`
        }}
      />
    </div>

    {
      isExpanded && <div>
        <Spacer y={3} />
        <p>{body}</p>
      </div>
    }
  </div>
}

function Testimonial({ name, company, body }) {
  return <div className="Home__testimonialBox">
    <p style={{ color: Colors.PRIMARY, fontWeight: 800, height: 30, fontSize: 50 }}>"</p>
    <Spacer y={3} />
    <p>{body}</p>
    <Spacer y={3} />
    <div style={{ display: "flex", alignItems: "center", columnGap: 8 }}>
      <img className="Home__testimonialImage" style={{ backgroundColor: "gray" }} alt="" />
      <p>
        <span style={{ fontWeight: 800 }}>{name}</span> from <span style={{ fontWeight: 800 }}>{company}</span>
      </p>
    </div>

  </div>
}

export default function HomePageOld() {
  const { width } = useWindowSize();
  const isMobile = width < 750

  useEffect(() => {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/62457ae70bfe3f4a8770acd2/1fvfmg6kk';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  }, [])

  return <div style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: isMobile ? 64 : 120,
  }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "300px 1fr" : "1fr 1fr",
      columnGap: 16,
      height: isMobile ? "auto" : 500,
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>
          <h2 className="Home__headingLarge" style={{
            fontSize: isMobile ? "3rem" : "5rem"
          }}>Bring your menu online</h2>
          <Spacer y={4} />
          <p style={{ fontSize: 20 }}>Mercado is an online menu for food stalls. No set up fees. No subscription. All you need is a QR code.</p>
          <Spacer y={4} />
          <Link to="book-demo">
            <MainButton style={{ display: "inline", width: 140 }} title="Book a demo" />
          </Link>
        </div>
      </div>
      <div style={{
        textAlign: "right",
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "left" : "right",
        marginRight: isMobile ? -16 : 0,
        overflow: "hidden",
      }}>
        <img alt="food stall" src="/img/food-stall.jpg" style={{ 
          height: isMobile ? 400 : 500, 
          objectFit: "contain",
          borderRadius: 16 
        }}/>
      </div>

    </div>

    {/* <div style={{ backgroundColor: "red", height: 20 }}>
      Video
    </div> */}

    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
      columnGap: 32,
      rowGap: 32
    }}>
      <Benefit
        title="Competitive pricing. No hidden fees."
        body={`Our technology allows you to take payments with a direct bank transfer, instead of paying hefty card fees. This allows us to offer a market leading price of ${(transactionFee * 100).toFixed(1)}% of each transaction, with no subscriptions, monthly minimums or setup costs.`}
      />
      <Benefit
        title="Customers can pay in 10 seconds."
        body="They don’t need to download an app, create an account or enter their card details. This frees up your staff from handling repetitive ordering and payment tasks, so they can focus on providing great customer service."
      />
      <Benefit
        title="A simple but powerful system."
        body="Mercado is easy for staff to pick up and start using. It works alongside your existing systems, with no extra equipment needed. And it gives you better control of your menu, allowing you to mark items as unavailable the second you run out of stock."
      />
    </div>

    {/* <div>
      <h2 className="Home__headingMedium" style={{ textAlign: "center" }}>Here's what our customers think</h2>
      <Spacer y={6} />
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        columnGap: 32,
        rowGap: 32
      }}>
        <Testimonial
          name="Ed"
          company="Sapling Spirits"
          body="This is an example testimonial text that will span multiple lines."
        />
        <Testimonial
          name="Ed"
          company="Sapling Spirits"
          body="This is an example testimonial text that will span multiple lines."
        />

      </div>
    </div> */}


    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      columnGap: 32,
      padding: isMobile ? "0 16px" : 0
    }}>
      <div>
        <h2
          className="Home__headingMedium"
          style={{ textAlign: isMobile ? "center" : "left" }}
        >
          FAQs
        </h2>
        <Spacer y={3} />
      </div>
      <div style={{ display: "grid", rowGap: 16 }}>
        <Accordion
          title="Can I customise my menu?"
          body="When you sign up to Mercado, you get a menu that's fully customisable. You can add images of meals, specify whether food is vegan, gluten free etc, and turn items off when you run out of stock."
        />
        <Accordion
          title="Is it easy to get set up?"
          body="Getting your online menu up and running couldn't be simpler. You'll need to create an account with us, and then we'll create your restaurant's menu according to your requirements, help train your staff, and mail you the QR codes you need."
        />
        <Accordion
          title="How does pricing work?"
          body={`We charge a ${(transactionFee * 100).toFixed(1)}% fee on transactions processed through Mercado. There are no other fees. We can offer a 1 month free trial if your company meets certain criteria - contact us to find out more.`}
        />
      </div>
    </div>

    <div style={{
      textAlign: "center"
    }}>
      <h2 className="Home__headingMedium" style={{
        width: isMobile ? "auto" : 500,
        margin: "auto"
      }}>
        Learn more about our product
      </h2>
      <Spacer y={4} />
      <Link to="book-demo">
        <MainButton title="Book a demo" style={{ display: "inline-block", width: 140 }} />
      </Link>
      
    </div>
  </div>
}
