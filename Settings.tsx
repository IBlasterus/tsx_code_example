import React from 'react'
import { TextField, Tooltip, Grid, Switch, Button, createTheme, ThemeProvider, Chip } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  selectHost,
  saveHost,
  selectLogin,
  saveLogin,
  selectPassword,
  savePassword,
  saveBlock,
  selectPower,
  setPower,
  selectBlock,
} from '../Softphone/softphoneSlice'
import { encodeObject } from '../../app/encoder'
import styles from './Settings.module.css'

/**
 * Форма "Настройки"
 * @constructor
 */
export function Settings() {
  const HOST_LABEL = 'Хост'
  const LOGIN_LABEL = 'Логин'
  const PASSWORD_LABEL = 'Пароль'
  const BLOCK_LABEL = 'block'

  const EMPTY_ERROR = 'Это поле нужно заполнить'
  const VRONG_ERROR = 'Не верное значение'

  const dispatch = useAppDispatch()
  const power = useAppSelector(selectPower)
  const stateHost = useAppSelector(selectHost)
  const stateLogin = useAppSelector(selectLogin)
  const statePassword = useAppSelector(selectPassword)
  const stateBlock = useAppSelector(selectBlock)
  const wrongStateParams = !stateHost || !stateLogin || !statePassword // Есть не верные параметры подключения

  const [host, setHost] = React.useState(stateHost)
  const [hostErrorText, setHostErrorText] = React.useState(!!stateHost ? '' : EMPTY_ERROR)
  const [login, setLogin] = React.useState(stateLogin)
  const [loginErrorText, setLoginErrorText] = React.useState(!!stateLogin ? '' : EMPTY_ERROR)
  const [password, setPassword] = React.useState(statePassword)
  const [passwordErrorText, setPasswordErrorText] = React.useState(!!statePassword ? '' : EMPTY_ERROR)
  const [btnText, setBtnText] = React.useState('Копировать ссылку')
  const [searchParams, setSearchParams] = useSearchParams()

  const theme = createTheme({
    components: {
      MuiFormLabel: {
        styleOverrides: {
          asterisk: {
            color: 'red',
            '&$error': { color: 'red' },
          },
        },
      },
    },
  })

  const handleChange = (event: any) => {
    const value = event.target.value
    const label = event.target.ariaLabel
    let host = stateHost
    let login = stateLogin
    let password = statePassword
    let block = stateBlock
    switch (label) {
      case HOST_LABEL:
        const VALID_IP = new RegExp(
          '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
        )
        const VALID_HOST = new RegExp(
          '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$'
        )

        setHost(value)

        // Валидация
        if (!value) {
          setHostErrorText(EMPTY_ERROR)
          host = ''
        } else if (value.length > 255 || !(VALID_IP.test(value) || VALID_HOST.test(value))) {
          setHostErrorText(VRONG_ERROR)
          host = ''
        } else {
          setHostErrorText('')
          host = value
        }
        dispatch(saveHost(host))

        break
      case LOGIN_LABEL:
        const VALID_LOGIN = new RegExp('^\\d{3,5}$')

        setLogin(value)

        // Валидация
        if (!value) {
          setLoginErrorText(EMPTY_ERROR)
          login = ''
        } else if (!VALID_LOGIN.test(value)) {
          setLoginErrorText(VRONG_ERROR)
          login = ''
        } else {
          setLoginErrorText('')
          login = value
        }
        dispatch(saveLogin(login))

        break
      case PASSWORD_LABEL:
        setPassword(value)

        // Валидация
        if (!value) {
          setPasswordErrorText(EMPTY_ERROR)
          password = ''
        } else if (value.length > 255) {
          setPasswordErrorText(VRONG_ERROR)
          password = ''
        } else {
          setPasswordErrorText('')
          password = value
        }
        dispatch(savePassword(password))

        break
      case BLOCK_LABEL:
        block = event.target.checked
        dispatch(saveBlock(block))
        break
      default:
        console.error(`Обработка не известного поля: [${label}]`)
    }

    // Если ошибок нет, обновляем URL
    if (!!host && !!login && !!password) {
      const newConfig = {
        connect: {
          host,
          login,
          password,
          block,
        },
      }
      const encodedConfig = encodeObject(newConfig)
      const updatedSearchParams = new URLSearchParams(searchParams.toString())
      updatedSearchParams.set('config', encodedConfig)
      setSearchParams(updatedSearchParams.toString())
    } else {
      searchParams.delete('config')
      const updatedSearchParams = new URLSearchParams(searchParams.toString())
      setSearchParams(updatedSearchParams.toString())
    }

    // Выключаем софтфон, если он включен
    if (power) dispatch(setPower(false))
  }

  const handleClick = () => {
    navigator.clipboard
      .writeText(document.location.href)
      .then(() => {
        const origBtnText = btnText
        setBtnText('Скопировано')
        setTimeout(() => setBtnText(origBtnText), 1500)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <div>
      <ThemeProvider theme={theme}>
        {wrongStateParams && <Chip label="Для начала работы введите настройки" color="error" sx={{ ml: '25px' }} />}
        <Tooltip title="Адрес сервера Asterisk" arrow enterDelay={2000}>
          <TextField
            value={host}
            label={HOST_LABEL}
            inputProps={{ 'aria-label': HOST_LABEL }}
            required
            error={!!hostErrorText}
            helperText={hostErrorText}
            variant="standard"
            size="small"
            margin="normal"
            onChange={handleChange}
          />
        </Tooltip>
        <Tooltip title="Логин SIP-пользователя" arrow enterDelay={2000}>
          <TextField
            value={login}
            label={LOGIN_LABEL}
            inputProps={{ 'aria-label': LOGIN_LABEL }}
            required
            error={!!loginErrorText}
            helperText={loginErrorText}
            variant="standard"
            size="small"
            margin="normal"
            onChange={handleChange}
          />
        </Tooltip>
        <Tooltip title="Пароль SIP-пользователя" arrow enterDelay={2000}>
          <TextField
            value={password}
            label={PASSWORD_LABEL}
            inputProps={{ 'aria-label': PASSWORD_LABEL }}
            required
            error={!!passwordErrorText}
            helperText={passwordErrorText}
            variant="standard"
            size="small"
            margin="normal"
            type="password"
            onChange={handleChange}
          />
        </Tooltip>
      </ThemeProvider>
      <Grid container spacing={3} justifyContent="center" sx={{ mt: '10px' }}>
        <Grid item xs={9}>
          Блокировать доступ к этим настройкам
        </Grid>
        <Grid item xs={3}>
          <Switch checked={stateBlock} onChange={handleChange} inputProps={{ 'aria-label': BLOCK_LABEL }} />
        </Grid>
      </Grid>
      <div className={styles.link}>
        <Button variant="contained" sx={{ ml: 'auto', mr: 'auto' }} onClick={handleClick} disabled={wrongStateParams}>
          {btnText}
        </Button>
      </div>
    </div>
  )
}
