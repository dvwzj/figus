const axios = require('axios')
const userAgents = require('user-agents')
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')
const _ = require('lodash')

class Service {
  constructor () {
    this.name = 'insta-stories.ru'
    this.piority = 2
    this.axios = axios.create()
  }

  setProxy (proxy) {
    let httpAgent
    if (proxy && proxy.host && proxy.port) {
      let { protocol } = proxy
      if (protocol === undefined) {
        protocol = 'http'
      }
      if (proxy.auth && proxy.auth.user && proxy.auth.pass) {
        if (protocol.startsWith('http')) {
          httpAgent = new HttpsProxyAgent(`${protocol}://${proxy.auth.user}:${proxy.auth.pass}@${proxy.host}:${proxy.port}`)
        } else if (protocol.startsWith('socks')) {
          httpAgent = new SocksProxyAgent(`${protocol}://${proxy.auth.user}:${proxy.auth.pass}@${proxy.host}:${proxy.port}`)
        }
      } else {
        if (protocol.startsWith('http')) {
          httpAgent = new HttpsProxyAgent(`${protocol}://${proxy.host}:${proxy.port}`)
        } else if (protocol.startsWith('socks')) {
          httpAgent = new SocksProxyAgent(`${protocol}://${proxy.host}:${proxy.port}`)
        }
      }
    } else if (proxy && proxy.match(/:\/\//)) {
      if (proxy.startsWith('http')) {
        httpAgent = new HttpsProxyAgent(proxy)
      } else if (proxy.startsWith('socks')) {
        httpAgent = new SocksProxyAgent(proxy)
      }
    }
    this.axios.defaults.httpAgent = this.axios.defaults.httpsAgent = httpAgent
    return this
  }

  get (username) {
    return new Promise((resolve, reject) => {
      try {
        const userAgent = (new userAgents()).toString()
        this
          .axios
          .get(
            `https://insta-stories.ru/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            const matches = res.data.match(/src="(main\.(.*?)\.js)"/)
            if (matches) {
              this
                .axios
                .get(
                  `https://insta-stories.ru/${matches[1]}`,
                  {
                    headers: {
                      'user-agent': userAgent
                    }
                  }
                )
                .then((res2) => {
                  const matches2 = res2.data.match(/this\.xTrip="(.*?)"/)
                  if (matches2) {
                    this
                      .axios
                      .post(
                        `https://api.insta-stories.ru/profile`,
                        {
                          string: username,
                          'x-trip': matches2[1]
                        },
                        {
                          headers: {
                            'user-agent': userAgent
                          }
                        }
                      )
                      .then((res3) => {
                        const user = {
                          pk: res3.data.user.pk,
                          username: res3.data.user.username,
                          full_name: res3.data.user.fullName,
                          is_private: undefined,
                          profile_pic_url: res3.data.user.picture,
                          profile_pic_id: undefined,
                          is_verified: undefined,
                          has_anonymous_profile_picture: undefined,
                          media_count: undefined,
                          geo_media_count: undefined,
                          follower_count: undefined,
                          following_count: undefined,
                          following_tag_count: undefined,
                          biography: undefined,
                          biography_with_entities: { raw_text: undefined, entities: [] },
                          external_url: undefined,
                          external_lynx_url: undefined,
                          has_biography_translation: undefined,
                          total_igtv_videos: undefined,
                          has_igtv_series: undefined,
                          total_clips_count: undefined,
                          total_ar_effects: undefined,
                          usertags_count: undefined,
                          is_favorite: undefined,
                          is_favorite_for_stories: undefined,
                          is_favorite_for_igtv: undefined,
                          is_favorite_for_highlights: undefined,
                          live_subscription_status: undefined,
                          is_interest_account: undefined,
                          has_chaining: undefined,
                          hd_profile_pic_versions: [
                            {
                              width: undefined,
                              height: undefined,
                              url: undefined
                            }
                          ],
                          hd_profile_pic_url_info: {
                            url: undefined,
                            width: undefined,
                            height: undefined
                          },
                          mutual_followers_count: undefined,
                          profile_context: undefined,
                          profile_context_links_with_user_ids: [],
                          profile_context_mutual_follow_ids: [],
                          has_highlight_reels: undefined,
                          can_be_reported_as_fraud: undefined,
                          is_business: undefined,
                          account_type: undefined,
                          professional_conversion_suggested_account_type: undefined,
                          is_call_to_action_enabled: undefined,
                          personal_account_ads_page_name: undefined,
                          personal_account_ads_page_id: undefined,
                          include_direct_blacklist_status: undefined,
                          is_potential_business: undefined,
                          show_post_insights_entry_point: undefined,
                          is_bestie: undefined,
                          has_unseen_besties_media: undefined,
                          show_account_transparency_details: undefined,
                          show_leave_feedback: undefined,
                          robi_feedback_source: undefined,
                          auto_expand_chaining: undefined,
                          highlight_reshare_disabled: undefined,
                          is_memorialized: undefined,
                          open_external_url_with_in_app_browser: undefined
                        }
                        resolve(user)
                      })
                      .catch(reject)
                  } else {
                    reject(`Service "${this.name}" not available (cannot get x-trip)`)
                  }
                })
                .catch(reject)
            } else {
              reject(`Service "${this.name}" not available`)
            }
          })
          .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = Service
