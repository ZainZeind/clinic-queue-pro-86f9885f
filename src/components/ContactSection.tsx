import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Terima kasih! Pesan Anda telah dikirim.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Alamat",
      content: "Gedung Teknik Industri, Universitas Diponegoro, Jl. Prof. Sudarto, SH, Tembalang, Semarang, Jawa Tengah 50275"
    },
    {
      icon: Phone,
      title: "Telepon",
      content: "(021) 1234-5678 / 0812-3456-7890"
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@kliniksehat.com"
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      content: "Senin - Sabtu: 08.00 - 20.00 WIB"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-background to-accent/5 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hubungi <span className="bg-gradient-primary bg-clip-text text-transparent">Kami</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ada pertanyaan? Tim kami siap membantu Anda
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 p-4 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{info.title}</h4>
                  <p className="text-sm text-muted-foreground">{info.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-8 rounded-2xl overflow-hidden border border-border h-64 shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.2396736573755!2d110.44068507499654!3d-7.050175468963785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708c09c07bc741%3A0x1e73711c2be3bb1e!2sDepartemen%20Teknik%20Industri%20UNDIP!5e0!3m2!1sen!2sid!4v1732635000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Klinik Sehat - Teknik Industri UNDIP"
              />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nama Lengkap</label>
                  <Input
                    placeholder="Masukkan nama Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subjek</label>
                  <Input
                    placeholder="Perihal pesan Anda"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Pesan</label>
                  <Textarea
                    placeholder="Tulis pesan Anda di sini..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow-primary">
                  Kirim Pesan
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
