#! /usr/bin/env node
import ora from 'ora'
import url from 'url'
import chalk from 'chalk'
import vorp from 'vorpal'
import open from 'open'
import { Api } from './helper/api'
import { sortByOrder } from './helper/array'

const vorpal = vorp()
const api = new Api()

/**
 * Get Elapsed Time from posted News to now
 * @param {number} timestamp - Posted TimeStamp News
 * @return {string} Elapsed Time
 */
const getElapsedTime = (newsTimeStamp) => {
  const NewsTime = new Date(newsTimeStamp * 1000).getTime()
  const currentDate = new Date().getTime()
  const diff = new Date(currentDate - NewsTime)
  /* eslint-disable max-len */
  return (diff.getHours() > 0) ? `${diff.getHours()} hour(s) ago` : `${diff.getMinutes()} minute(s) ago`
/* eslint-enable max-len */
}

/**
 * Display News in terminal
 * @param {object} Vorpal Object
 */
const displayNews = (topNewsList, vp) => {
  topNewsList
    .sort(sortByOrder)
    .forEach((item) => {
      const ItemVM = {
        title: chalk.cyan(item.title),
        hostname: (item.url) ? url.parse(item.url).hostname : '',
        score: chalk.green(`${item.score} points`),
        by: chalk.gray(`By ${item.by}`),
        time: chalk.white(getElapsedTime(item.time)),
        descendants: chalk.white(`${item.descendants} comments`),
      }
      vp.log(`${item.order}. ${ItemVM.title} (${ItemVM.hostname})`)
      vp.log(`   ${ItemVM.score} ${ItemVM.by} ${ItemVM.time} | ${ItemVM.descendants}`)
    })
}

/**
 * Display News in terminal
 * @param {number} News order
 * @param {object} Vorpal Object
 */
const openNews = (order, vp) => {
  if (typeof (order) === 'number') {
    const selectedNews = api.getTopNewsList.find((news) => news.order === order)
    if (selectedNews) {
      open(selectedNews.url)
    } else {
      vp.log(chalk.red('This news doesn\'t exist'));
    }
  } else {
    vp.log(chalk.red('Please enter a correct news number'));
  }
}

/**
 * Add 'news' command to Vorpal
 */
vorpal
  .command('news', 'Get top news')
  .action(function act(args, callback) {
    const spinner = ora('Loading news')
    spinner.start()
    api.getTopNews().then((topNewsList) => {
      spinner.stop()
      displayNews(topNewsList, this)
      callback()
    }).catch(() => callback())
  })

/**
 * Add 'read' command to Vorpal
 * Usage : read <newsNumber>
 */
vorpal
  .command('read <news>', 'Exemple : read 4')
  .action(function act(args, callback) {
    openNews(args.news, this)
    callback()
  });

/**
 * Sets the prompt delimiter to say "hnr$" and show it
 */
vorpal
  .delimiter('hnr$')
  .show()
