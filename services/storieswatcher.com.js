const axios = require('axios')
const userAgents = require('user-agents')
const HttpsProxyAgent = require('https-proxy-agent')
const SocksProxyAgent = require('socks-proxy-agent')
const _ = require('lodash')
const moment = require('moment-timezone')
const { JSDOM } = require('jsdom')
const jsdom = new JSDOM
const $ = require('jquery')(jsdom.window)

class Service {
  constructor () {
    this.name = 'storieswatcher.com'
    this.piority = 5
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
            `https://www.storieswatcher.com/${username}`,
            {
              headers: {
                'user-agent': userAgent
              }
            }
          )
          .then((res) => {
            let profilePicUrl
            const matches = res.data.match(/background: transparent url\('(.*?)'\)/)
            if (matches) {
              profilePicUrl = matches[1]
            }
            const user = {
              pk: undefined,
              username: $(res.data).find('.user_insta').text().split('@')[1],
              full_name: $(res.data).find('h1.profile-name').text(),
              is_private: undefined,
              profile_pic_url: profilePicUrl,
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
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = Service
