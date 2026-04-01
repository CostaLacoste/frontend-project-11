import 'bootstrap/dist/css/bootstrap.min.css'
import * as yup from 'yup'
import i18next from 'i18next'
import ru from './locales/ru.js'
import Model from './model.js'
import View from './view.js'
import Controller from './controller.js'
const bootstrapApp = async () => {
  const i18n = i18next.createInstance()
  await i18n.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  })
  yup.setLocale({
    mixed: {
      required: () => i18n.t('errors.required'),
    },
    string: {
      url: () => i18n.t('errors.invalidUrl'),
    },
  })
  const model = new Model()
  const view = new View(document, i18n)
  view.mountLayout()
  view.applyFormTexts()
  const controller = new Controller(model, view, i18n)
  controller.start()
}
await bootstrapApp()
