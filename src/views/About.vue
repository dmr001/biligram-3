<template>
  <v-dialog
    v-model="aboutDialog"
    transition="dialog-bottom-transition"
    scrollable
    max-width="40%"
  >
    <v-card>
      <v-toolbar color="primary" dark>
        Discharge planning
        <v-spacer></v-spacer>
        <v-btn
          x-small
          fab
          depressed
          dark
          color="primary"
          @click="riskFactorsDialog = false"
          ><v-icon>clear</v-icon></v-btn
        >
      </v-toolbar>
      <v-card-title> Hyperbilirubinemia risk factors </v-card-title>

      <v-card-text>
        <ul>
          <li>
            Exclusive breastfeeding, particularly if nursing is not going well
            and/or weight loss is excessive (8 – 10%)
          </li>

          <li>
            Isoimmune or other hemolytic disease (eg, G6PD deficiency,
            hereditary spherocytosis)
          </li>

          <li>Previous sibling with jaundice</li>
          <li>Cephalohematoma or significant bruising</li>

          <li>East Asian race</li>
        </ul>
      </v-card-text>
      <v-divider></v-divider>
      <br />
      <v-card-text class="text-caption">
        <p>
          <i
            >The gestational age and the predischarge TSB or TcB level are the
            most important factors that help to predict the risk of
            hyperbilirubinemia. The risk increases with each decreasing week of
            gestation from 42–35 weeks.</i
          >
        </p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="riskFactorsDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
