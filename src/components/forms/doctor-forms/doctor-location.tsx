"use client";

import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: any;
  setValue: (data: any) => void;
};

export default function DoctorLocation({ value, setValue }: Props) {
  const selectedCountry = value?.country || "";
  const selectedState = value?.state || "";
  const selectedCity = value?.city || "";
  const address = value?.address || "";
  const pincode = value?.pincode || "";
  const mapLink = value?.mapLink || "";

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  /* LOAD STATES */
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      return;
    }

    setStates(State.getStatesOfCountry(selectedCountry));
    setCities([]);
  }, [selectedCountry]);

  /* LOAD CITIES */
  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCities([]);
      return;
    }

    setCities(
      City.getCitiesOfState(selectedCountry, selectedState) || []
    );
  }, [selectedCountry, selectedState]);

  /* AUTO MAP */
  useEffect(() => {
    if (!address && !selectedCity && !pincode) {
      setValue({ ...value, mapLink: "" });
      return;
    }

    const q = encodeURIComponent(
      `${address} ${selectedCity} ${pincode}`.trim()
    );

    setValue({
      ...value,
      mapLink: `https://maps.google.com/maps?q=${q}&z=15&output=embed`,
    });
  }, [address, selectedCity, pincode]);

  return (
    <div className="bg-white p-6 rounded-xl border">
      <h2 className="font-semibold mb-3">Doctor Location</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* COUNTRY */}
        <div>
          <label className="text-sm font-medium">Country</label>
          <Select
            value={selectedCountry}
            onValueChange={(val) =>
              setValue({
                ...value,
                country: val,
                state: "",
                city: "",
                address: "",
                pincode: "",
                mapLink: "",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {Country.getAllCountries().map((c) => (
                <SelectItem key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* STATE */}
        <div>
          <label className="text-sm font-medium">State</label>
          <Select
            value={selectedState}
            disabled={!selectedCountry}
            onValueChange={(val) =>
              setValue({
                ...value,
                state: val,
                city: "",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CITY */}
        <div>
          <label className="text-sm font-medium">City</label>
          <Select
            value={selectedCity}
            disabled={!selectedState}
            onValueChange={(val) =>
              setValue({
                ...value,
                city: val,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PINCODE + ADDRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="text-sm font-medium">Pincode</label>
          <Input
            value={pincode}
            onChange={(e) =>
              setValue({ ...value, pincode: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Full Address</label>
          <Textarea
            rows={3}
            value={address}
            onChange={(e) =>
              setValue({ ...value, address: e.target.value })
            }
          />
        </div>
      </div>

      {mapLink && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">
            Location Preview
          </h3>
          <iframe
            src={mapLink}
            className="w-full h-64 rounded-xl border"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
