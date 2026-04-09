import { renderToString } from '@vue/server-renderer'
import { h } from 'vue'
import { Cpu, Connection, MobilePhone, Box, Trophy } from '@element-plus/icons-vue'

async function generate() {
  const icons = {
    Cpu: await renderToString(h(Cpu)),
    Connection: await renderToString(h(Connection)),
    MobilePhone: await renderToString(h(MobilePhone)),
    Box: await renderToString(h(Box)),
    Trophy: await renderToString(h(Trophy)),
  }
  console.log(JSON.stringify(icons, null, 2))
}

generate()
