<template>
  <div class="wrapper" :class="{ disabled: disabled }">
    <Card>
      <template v-slot:header>
        <div style="position: relative">
          <div class="match-wrapper">
            <div class="open-link">
              <i
                class="pi pi-external-link"
                @click="openLink(`${VUE_APP_API_URL}/storage/${match.file.key}?id=${match.id}&box=true`)"
              ></i>
            </div>
            <div class="selected-overlay" :class="{ selected: selected }"></div>
            <div v-for="detector in results" :key="detector">
              <div
                v-if="detector.box !== undefined && loaded"
                :class="'box ' + detector.detector"
                :style="box(detector.box)"
              ></div>
            </div>
            <img
              @click="$parent.$emit('toggle', match)"
              :class="loaded ? 'thumbnail' : 'thumbnail lazy'"
              :src="'data:image/jpg;base64,' + match.file.base64"
              :data-key="match.file.key"
              :onload="assetLoaded"
            />
          </div>
          <div v-if="!loaded" style="position: absolute; top: 50%; left: 50%; margin-top: -1rem; margin-left: -1rem">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <DataTable :value="results" class="p-datatable-sm" responsiveLayout="scroll">
          <Column field="detector" header="Detector">
            <template v-slot:body="slotProps">
              <Badge
                :value="slotProps.data.detector + '&nbsp;&nbsp;&nbsp;'"
                :severity="slotProps.data.match ? 'success' : 'danger'"
              />
              <div :class="'icon ' + slotProps.data.detector"></div>
            </template>
          </Column>
          <Column field="name" header="Name"></Column>
          <Column field="confidence" header="%"></Column>
          <Column field="box" header="Box">
            <template v-slot:body="slotProps">
              {{ slotProps.data.box.width }}x{{ slotProps.data.box.height }}
            </template>
          </Column>
          <Column field="duration" header="Time">
            <template v-slot:body="slotProps">
              {{ slotProps.data.duration || 'N/A' }}
            </template>
          </Column>
        </DataTable>
      </template>
      <template v-slot:footer>
        <div class="p-d-flex p-jc-between p-ai-center">
          <small>{{ createdAt.ago }}</small>
          <div>
            <Badge v-if="match.camera" :value="match.camera" />
            <Badge v-if="match.type" :value="match.type" />
            <Badge v-if="match.zones.length" :value="[...match.zones].join(', ')" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import Badge from 'primevue/badge';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

export default {
  props: {
    match: Object,
    loaded: Boolean,
    selected: Boolean,
    disabled: Boolean,
  },
  components: {
    Badge,
    Card,
    DataTable,
    Column,
  },
  data() {
    return {
      VUE_APP_API_URL: process.env.VUE_APP_API_URL,
      timestamp: Date.now(),
    };
  },
  created() {
    setInterval(() => {
      this.timestamp = Date.now();
    }, 1000);
  },
  methods: {
    assetLoaded() {
      this.$parent.$emit('assetLoaded', this.match.id);
    },
    openLink(url) {
      window.open(url);
    },
    box(obj) {
      const { width, height } = this.match.file;
      const values = {
        top: obj.width ? `${(obj.top / height) * 100}%` : 0,
        width: obj.width ? `${(obj.width / width) * 100}%` : 0,
        height: obj.width ? `${(obj.height / height) * 100}%` : 0,
        left: obj.width ? `${(obj.left / width) * 100}%` : 0,
      };

      return `width: ${values.width}; height: ${values.height}; top: ${values.top}; left: ${values.left}`;
    },
  },
  computed: {
    results() {
      let data = [];
      if (Array.isArray(this.match.response)) {
        this.match.response.forEach((result) => {
          const results = result.results.map((obj) => ({
            detector: result.detector,
            duration: result.duration,
            ...obj,
          }));
          data = data.concat(results);
        });
      } else {
        data.push(this.match.meta);
      }

      return data;
    },
    createdAt() {
      const units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

      const dateTime = DateTime.fromISO(this.match.createdAt);
      const diff = dateTime.diffNow().shiftTo(...units);
      const unit = units.find((u) => diff.get(u) !== 0) || 'second';

      const relativeFormatter = new Intl.RelativeTimeFormat('en', {
        numeric: 'auto',
      });
      return { ago: relativeFormatter.format(Math.trunc(diff.as(unit)), unit), timestamp: this.timestamp };
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep(.p-datatable-table) {
  font-size: 0.9rem;

  .p-datatable-thead > tr > th {
    border-top: 0;
  }

  td {
    position: relative;
  }

  .p-badge {
    font-size: 0.75rem;
  }

  .icon {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 100%;
    position: absolute;
    top: 50%;
    margin-top: -5px;
    margin-left: -19px;
    background: #78cc86;
  }
  .icon.compreface {
    background: var(--blue-600);
  }
  .icon.deepstack {
    background: var(--orange-600);
  }
  .icon.facebox {
    background: var(--indigo-600);
  }
}

.open-link {
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 2;
}

.wrapper {
  transition: opacity 0.5s;

  &.disabled {
    opacity: 0.2;

    img.thumbnail {
      cursor: not-allowed;
    }
  }
}

img.thumbnail {
  width: 100%;
  display: block;
  cursor: pointer;
  transition: opacity 0.5s;

  &.lazy {
    opacity: 0;
  }
}

.match-wrapper {
  position: relative;
}

.p-badge {
  flex: 1 1 auto;
  margin-right: 5px;
  &:last-child {
    margin-right: 0;
  }
}

.selected-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid #78cc86;
  z-index: 2;
  display: none;
  pointer-events: none;

  &.selected {
    display: block;
  }
}

.box {
  z-index: 1;
  position: absolute;
  border: 2px solid;
  pointer-events: none;
  border-color: #78cc86;
}

.box.compreface {
  border-color: var(--blue-600);
}
.box.deepstack {
  border-color: var(--orange-600);
}
.box.facebox {
  border-color: var(--indigo-600);
}

.p-card {
  ::v-deep(.p-card-content) {
    padding-top: 0;
    padding-bottom: 0;
  }
  ::v-deep(.p-card-body) {
    @media only screen and (max-width: 576px) {
      padding: 0.75rem;
    }
  }
}
</style>
