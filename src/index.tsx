import {
  Box,
  Button,
  ChakraProvider,
  Flex,
  Heading,
  Image,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import * as React from "react";
import { render } from "react-dom";
import { motion } from "framer-motion";

import { MdRecordVoiceOver } from "react-icons/md";

import { numberToEnglish } from "./parser";
import "./styles.css";

const MotionBox = motion.custom(Box);
const MotionImg = motion.custom(Image);

const FALLBACK_HUGE_NUMBER = "It was Yuuuuuge!";

function App() {
  const [value, setValue] = React.useState("123456");

  const handleValueChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => setValue(e.target.value.replace(/(\.\d{2}).+$/, "$1")), []);

  const spelling = React.useMemo(() => {
    try {
      return numberToEnglish(value);
    } catch (error) {
      console.log(error);
      return FALLBACK_HUGE_NUMBER;
    }
  }, [value]);

  const isCurrency = String(value).includes(".");

  const handleSpeak = React.useCallback(() => {
    const voceIndex = spelling === FALLBACK_HUGE_NUMBER ? 1 : 0;

    const msg = new SpeechSynthesisUtterance(spelling);

    msg.voice = speechSynthesis.getVoices()[voceIndex];
    msg.rate = voceIndex ? 0.6 : 0.8;
    window.speechSynthesis.speak(msg);
  }, [spelling]);

  return (
    <Box
      bg="gray.800"
      color="white"
      display="grid"
      placeItems="center"
      p="2rem"
      h="100vh"
      justify="center"
      align="center"
    >
      <MotionBox
        maxW="36rem"
        transition={{ duration: 0.5, delay: 0.5 }}
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Stack spacing="1rem">
          <Heading as="h1">Number to English spelling</Heading>
          <Text>(decimals will be spelled as currency)</Text>
          <Flex align="center" position="relative">
            {isCurrency && (
              <MotionBox
                mr="2"
                fontSize="1.5em"
                position="absolute"
                fontWeight="600"
                left="-1.5rem"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                $
              </MotionBox>
            )}
            <Input
              type="number"
              min="0"
              placeholder="123456"
              width="100%"
              value={String(value)}
              onChange={handleValueChange}
            />
          </Flex>
          {Boolean(spelling && value) && (
            <>
              <Heading as="h2">
                {spelling === FALLBACK_HUGE_NUMBER ? (
                  <MotionImg
                    src="https://memegenerator.net/img/instances/65142311/huge.jpg"
                    alt={FALLBACK_HUGE_NUMBER}
                    initial={{
                      scale: 0
                    }}
                    animate={{ scale: 1 }}
                    borderRadius=".75rem"
                    overflow="hidden"
                  />
                ) : (
                  spelling
                )}
              </Heading>
              {window.speechSynthesis && (
                <Button
                  h="3rem"
                  w="3rem"
                  p="0"
                  alignSelf="center"
                  onClick={handleSpeak}
                >
                  <Box as={MdRecordVoiceOver} color="gray.800" />
                </Button>
              )}
            </>
          )}
        </Stack>
      </MotionBox>
    </Box>
  );
}

const rootElement = document.getElementById("root");

render(
  <ChakraProvider>
    <App />
  </ChakraProvider>,
  rootElement
);
