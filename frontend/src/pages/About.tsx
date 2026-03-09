import { motion } from "framer-motion";
import { Hand, Globe, Mic, Brain, Users } from "lucide-react";
import Header from "@/components/Header";

const features = [
  {
    icon: Hand,
    title: "Real-Time Gesture Recognition",
    description:
      "Detects Indian Sign Language gestures instantly using MediaPipe hand landmark tracking and deep learning models."
  },
  {
    icon: Brain,
    title: "AI Gesture Classification",
    description:
      "Uses an MLP model for alphabet & number recognition and an LSTM model for dynamic word gestures."
  },
  {
    icon: Globe,
    title: "Multilingual Translation",
    description:
      "Recognized English text can be translated into multiple languages using Googletrans integration."
  },
  {
    icon: Mic,
    title: "Speech Output",
    description:
      "Converted text can be spoken using text-to-speech technology for easier communication."
  },
  {
    icon: Users,
    title: "Inclusive Communication",
    description:
      "Helps deaf and non-signers communicate effectively in classrooms, hospitals, and public spaces."
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        <Header isConnected={true} />

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <h1 className="text-4xl font-bold text-gradient">
            About Gesture Bridge
          </h1>

          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
            Gesture Bridge is an AI-powered system that translates Indian Sign
            Language gestures into text and speech in real time. It helps deaf
            or hard-of-hearing individuals communicate easily with people who
            do not understand sign language.
          </p>
        </motion.div>

        {/* PROBLEM SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-16 glass-panel p-8 rounded-xl"
        >
          <h2 className="text-2xl font-bold mb-4">The Problem</h2>

          <p className="text-muted-foreground leading-relaxed">
            Many deaf and mute individuals rely on sign language to communicate,
            but most people do not understand sign language. This creates major
            communication barriers in schools, hospitals, workplaces, and public
            services.
            <br /><br />
            Gesture Bridge solves this problem by automatically recognizing
            sign language gestures and converting them into readable text and
            speech output.
          </p>
        </motion.div>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-10">
            Key Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {features.map((feature, i) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-6 rounded-xl hover:scale-105 transition"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="text-primary w-6 h-6" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* TECHNOLOGY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 glass-panel p-8 rounded-xl"
        >
          <h2 className="text-2xl font-bold mb-4">
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-sm">

            <div>
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-muted-foreground">
                React<br/>
                Tailwind CSS<br/>
                Framer Motion
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Backend</h3>
              <p className="text-muted-foreground">
                Python<br/>
                FastAPI<br/>
                TensorFlow / Keras
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Computer Vision</h3>
              <p className="text-muted-foreground">
                MediaPipe Hands<br/>
                OpenCV<br/>
                Googletrans API
              </p>
            </div>

          </div>
        </motion.div>

        {/* TEAM */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-6">
            Project Team
          </h2>

          <div className="grid md:grid-cols-5 gap-4 text-sm text-muted-foreground">
            <div>A. Sushma Srivalli Gayathri</div>
            <div>B. Krishna Raja Sree</div>
            <div>P. Sheela Saini</div>
            <div>S. Lahari Sai Nagadurga</div>
            <div>G. Jhansi Lakshmi</div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Guide: Mr. Ch. Phaneendra Varma
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default About;