import { useEffect, useState } from 'react'
import axios from 'axios'

// Yhteinen maa- ja kielivalikko hakupalkille ja suodattimille.
export default function MovieOrigin({
  kind,
  value,
  onChange,
  id,
  emptyLabel
}) {

  // Valintalistojen sisältö ja latauksen tila.
  const [options, setOptions] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {

    const controller = new AbortController()

    // Tarkistetaan, haetaanko maita vai kieliä.
    const isCountry = kind === 'country'

    // Valitaan oikea backend-reitti.
    const endpoint = isCountry
      ? '/movies/countries'
      : '/movies/languages'

    axios.get(endpoint, {
      signal: controller.signal
    })

      .then(({ data }) => {

        if (controller.signal.aborted) return

        // Muodostetaan maiden ja kielten suomenkieliset nimet.
        const names = new Intl.DisplayNames(['fi'], {
          type: isCountry ? 'region' : 'language',
          fallback: 'none'
        })

        // Maakoodit, joita ei haluta näyttää valintalistassa.
        const excludedCountries = [
          'AA',
          'ZZ'
        ]

        // Map estää saman maa- tai kielikoodin
        // lisäämisen listaan useammin kuin kerran.
        const uniqueOptions = new Map()

        // Käydään läpi TMDB:n palauttamat maat tai kielet.
        data.forEach(item => {

          // Luetaan maa- tai kielikoodi.
          const code = isCountry
            ? item.iso_3166_1
            : item.iso_639_1

          // Hyväksytään vain oikeanmuotoiset kaksikirjaimiset koodit.
          if (typeof code !== 'string') return

          if (isCountry && !/^[A-Z]{2}$/.test(code)) return

          if (!isCountry && !/^[a-z]{2}$/.test(code)) return

          // Piilotetaan käyttäjäkohtaisille maakoodeille
          // varatut koodialueet.
          // Esimerkiksi XC, XG ja XI.
          if (
            isCountry &&
            (
              excludedCountries.includes(code) ||
              /^(Q[M-Z]|X[A-Z])$/.test(code)
            )
          ) {
            return
          }

          // Käytetään ensisijaisesti suomenkielistä nimeä.
          // Jos suomennosta ei löydy, käytetään TMDB:n nimeä.
          const translatedName = names.of(code)

          const name =
            translatedName ||
            item.english_name ||
            item.name ||
            code

          // Lisätään koodi ja nimi vain kerran.
          if (!uniqueOptions.has(code)) {
            uniqueOptions.set(code, {
              code,
              name
            })
          }
        })

        // Muutetaan Map tavalliseksi taulukoksi.
        const list = [...uniqueOptions.values()]

        // Lasketaan, kuinka monta kertaa kukin nimi esiintyy.
        const nameCounts = new Map()

        list.forEach(item => {

          const nameKey = item.name.toLocaleLowerCase('fi')

          nameCounts.set(
            nameKey,
            (nameCounts.get(nameKey) || 0) + 1
          )
        })

        // Jos eri koodeilla on sama nimi,
        // lisätään koodi nimen perään.
        const finalList = list.map(item => {

          const nameKey = item.name.toLocaleLowerCase('fi')

          return {
            ...item,

            name: nameCounts.get(nameKey) > 1
              ? `${item.name} (${item.code})`
              : item.name
          }
        })

        // Järjestetään maat ja kielet aakkosjärjestykseen.
        finalList.sort((a, b) =>
          a.name.localeCompare(b.name, 'fi')
        )

        // Tallennetaan valmis valintalista.
        setOptions(finalList)
        setStatus('ready')

      })

      .catch(() => {

        // Ei näytetä virhettä, jos pyyntö peruttiin.
        if (!controller.signal.aborted) {
          setStatus('error')
        }
      })

    // Perutaan vanha pyyntö komponentin poistuessa.
    return () => controller.abort()

  }, [kind])

  return (

    // Yhteinen pudotusvalikko maille ja kielille.
    <select
      id={id}
      className="origin-select"
      aria-label={
        kind === 'country'
          ? 'Alkuperämaa'
          : 'Alkuperäinen kieli'
      }
      value={value}
      onChange={event => onChange(event.target.value)}
    >

      {/* Valikon oletusteksti ja latauksen tila. */}
      <option value="">
        {status === 'loading'
          ? 'Ladataan...'
          : status === 'error'
            ? 'Lataus epäonnistui'
            : emptyLabel}
      </option>

      {/* Säilytetään valittu arvo myös silloin,
          kun valintalista ei ole vielä latautunut
          tai koodi puuttuu listasta. */}
      {value && !options.some(item => item.code === value) && (
        <option value={value}>
          {value}
        </option>
      )}

      {/* Luodaan jokaiselle maalle tai kielelle oma valinta. */}
      {options.map(item => (
        <option
          key={item.code}
          value={item.code}
        >
          {item.name}
        </option>
      ))}

    </select>
  )
}