import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Link,
  Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import { Annoucement } from '@/components/Announcement'
import { useState, useEffect, useRef } from 'react'
import party from 'party-js'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  usePrepareSendTransaction,
  useSignMessage,
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { BigNumber } from 'ethers'
import dynamic from 'next/dynamic'
import { SignCheker } from '@/components/SignCheck'

export default function CreateAnnouncePage() {
  const [clientIsConnected, setClientIsConnected] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setClientIsConnected(isConnected)
  }, [isConnected])
  const [showSpinner, setShowSpinner] = useState(false)

  const [message, setMessage] = useState('')
  const [messageSigned, setMessageSigned] = useState('')

  const signMessage = useSignMessage({
    message,
    onSuccess(data) {
      setMessageSigned(data)
    },
  })
  const [author, setAuthor] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [status, setStatus] = useState('')
  const [showMaxLength, setShowMaxLength] = useState(false)
  const ref = useRef(null)

  const handleClick = async (hash, address) => {
    setLoading(true)
    const res = await fetch('/api/announce/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        messageSigned,
        hash,
        address,
        author,
      }),
    })
    const data = await res.json()
    if (data && data.error) {
      setStatus('ERROR')
      setLoading(false)
      setShowSpinner(false)
      return
    }

    setRefresh(true)
    setLoading(false)
    setShowSpinner(false)
    setStatus('Done! Check it out 👆')
  }

  useEffect(() => {
    ref.current.addEventListener('click', () => {
      party.confetti(ref.current)
    })
  }, [])

  const { config } = usePrepareSendTransaction({
    request: {
      to: process.env.NEXT_PUBLIC_DONATION_ADDRESS,
      value: BigNumber.from(
        ethAmount ? '0x' + (ethAmount * 1e18).toString(16) : '0',
      ),
    },
  })

  const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction({
    ...config,
    onSuccess(data) {
      setShowSpinner(true)
      setStatus('Confirming...  ---> DO NOT REFERSH!!! <---')
      // wait for 1 confirmation
      data.wait(1).then(() => {
        handleClick(data.hash, address)
      })
    },
  })

  const handleDonate = () => {
    sendTransaction()
    setRefresh(true)
  }

  const handleSignMessage = async () => {
    const data = await signMessage.signMessage()
    setMessageSigned(data)
  }

  const handleEnterMessage = (e) => {
    // check if message is longer than 140 chars
    if (e.target.value.length > 140) {
      setShowMaxLength(true)
      return
    } else {
      setShowMaxLength(false)
      setMessage(e.target.value)
    }
  }

  useEffect(() => {
    ref.current.addEventListener('click', () => {
      party.confetti(ref.current)
    })
  }, [])

  return (
    <>
      <Head>
        <title>VIP SECTION</title>
        <meta
          name="description"
          content="Generate custom cigs online free now"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Annoucement refresh={refresh} setRefresh={setRefresh} />
      <Box
        display="flex"
        flexDir="column"
        justifyContent="center"
        alignItems="center"
        w="95vw"
        mx={2}
      >
        <Box display="flex" alignItems="center" flexDir="column" w="100%">
          <Heading fontSize="3vh" margin="20px">
            create an announcement
          </Heading>
          <Text>it goes up there 👆 until the next donation </Text>
          <Box w={['100%', '80%', '60%', '50%']}>
            <Box mb={3}>
              <Input
                placeholder="message"
                onChange={handleEnterMessage}
                value={message}
                my={1}
              />
              <SignCheker
                message={message}
                address={address}
                sign={messageSigned}
              />
              {showMaxLength && (
                <Text color="red.500">max message length 140 chars</Text>
              )}
            </Box>
            <Input
              placeholder="twitter handle (optional)"
              onChange={(e) => setAuthor(e.target.value)}
            />
            <Box display="flex">
              <Button onClick={connect} my={2} colorScheme="orange" w="100%">
                {clientIsConnected
                  ? address.slice(0, 6) + '...' + address.slice(-4)
                  : 'CONNECT WALLET'}
              </Button>
              {clientIsConnected && (
                <Button ml={3} onClick={handleSignMessage} my={2} w="100%">
                  Sign Message
                </Button>
              )}
            </Box>

            <Flex display={clientIsConnected ? 'flex' : 'none'}>
              <Input
                placeholder="ETH amount"
                onChange={(e) => setEthAmount(e.target.value)}
                my={2}
                type="number"
                min="0"
                step="0.005"
              />
              <Button
                onClick={handleDonate}
                my={2}
                ml={2}
                w="100%"
                colorScheme="blue"
                isDisabled={
                  !clientIsConnected ||
                  !ethAmount ||
                  !messageSigned ||
                  ethAmount < 0.005
                }
                ref={ref}
                isLoading={isLoading}
              >
                Donate & Announce
              </Button>
            </Flex>
            {status !== '' && (
              <Box
                p={6}
                outline="4px solid lightgreen"
                fontFamily="mono"
                backgroundColor="black"
                color="white"
                borderRadius="10px"
              >
                {status} {showSpinner && <Spinner />}
              </Box>
            )}
            <Link pt={5} href="/">
              {'<-'} back to render
            </Link>
          </Box>
        </Box>
      </Box>
      <Box mt={6} display="flex" justifyContent="center">
        <Text fontSize="6vh" color="gray.500">
          🙏
        </Text>
      </Box>
    </>
  )
}
